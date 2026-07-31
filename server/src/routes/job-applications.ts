import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticate, AuthRequest, getSecret } from '../middleware/auth.js';
import JobApplication, { APPLICATION_STATUSES, ApplicationStatus } from '../models/JobApplication.js';
import Candidate from '../models/Candidate.js';
import Attachment, { AttachmentType, IAttachment } from '../models/Attachment.js';
import JobOffer from '../models/JobOffer.js';
import { sendJobConfirmation, sendNewApplicationAlert, sendInterviewInvitation, sendApplicationAccepted, sendApplicationRejected } from '../services/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'applications');

/* -------------------------------------------------------------------------
 * Upload : vérification stricte type MIME + extension, taille max 15 Mo.
 * Les fichiers reçoivent un nom aléatoire sur disque (pas de nom original).
 * ----------------------------------------------------------------------- */
const allowedMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedExts = /\.(pdf|doc|docx)$/i;
const maxFileSize = 15 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'app-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const mimeOk = allowedMimes.includes(file.mimetype);
    const extOk = allowedExts.test(path.extname(file.originalname).toLowerCase());
    if (mimeOk && extOk) {
      cb(null, true);
    } else {
      cb(new Error('Formats acceptés : PDF, DOC, DOCX uniquement'));
    }
  },
  limits: { fileSize: maxFileSize, files: 7 },
});

const router = Router();

/* Nettoyage anti-injection HTML (conserve les caractères normaux comme &) :
 * le rendu React échappe déjà le contenu, et le PDF admin est échappé à la
 * génération — on supprime donc uniquement les balises et caractères de contrôle. */
const sanitize = (value: string): string =>
  value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

const validateApplication = [
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').customSanitizer(sanitize),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis').customSanitizer(sanitize),
  body('email').trim().isEmail().withMessage('Adresse email invalide').normalizeEmail(),
  body('phone')
    .trim()
    .matches(/^[\d\s+\-().]{8,20}$/)
    .withMessage('Numéro de téléphone invalide')
    .customSanitizer(sanitize),
  body('position').trim().notEmpty().withMessage('Le poste est requis').customSanitizer(sanitize),
  body('education').trim().notEmpty().withMessage('La formation est requise').customSanitizer(sanitize),
  body('experience').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('address').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('motivationMessage').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('jobOfferId').optional({ values: 'falsy' }).isMongoId().withMessage('Offre d\'emploi invalide'),
];

/** Supprime du disque les fichiers temporairement uploadés (en cas d'échec). */
const removeUploadedFiles = (files: { [fieldname: string]: Express.Multer.File[] } | undefined): void => {
  if (!files) return;
  for (const field of Object.values(files)) {
    for (const file of field) {
      try {
        fs.unlinkSync(file.path);
      } catch {
        // fichier déjà supprimé ou absent — ignorer
      }
    }
  }
};

const populates = () => [
  { path: 'candidate', select: 'lastName firstName email phone address education experience createdAt' },
  { path: 'attachments' },
  { path: 'jobOffer', select: 'title department location contractType' },
];

/* -------------------------------------------------------------------------
 * Liste des candidatures (recherche / filtres / tri) — admin uniquement.
 * ----------------------------------------------------------------------- */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, position, status, sortBy, sortOrder } = req.query;
    const filter: Record<string, unknown> = {};

    // Recherche plein-texte sur le candidat (nom, prénom, email) et le poste
    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { lastName: searchRegex },
        { firstName: searchRegex },
        { email: searchRegex },
        { position: searchRegex },
      ];
    }

    if (position && typeof position === 'string') {
      filter.position = position;
    }

    if (status && typeof status === 'string' && APPLICATION_STATUSES.includes(status as ApplicationStatus)) {
      filter.status = status;
    }

    const sortField = sortBy === 'name' ? 'lastName' : sortBy === 'email' ? 'email' : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;

    const apps = await JobApplication.find(filter)
      .populate(populates())
      .sort({ [sortField]: order });

    res.json(apps);
  } catch (error) {
    console.error('[job-applications] GET / failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des candidatures' });
  }
});

/* Liste des postes distincts (filtre admin) */
router.get('/positions', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const positions = await JobApplication.distinct('position');
    res.json(positions);
  } catch (error) {
    console.error('[job-applications] GET /positions failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des postes' });
  }
});

/* Statistiques par statut (widgets du tableau de bord) */
router.get('/stats', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const stats = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await JobApplication.countDocuments();
    const statusMap: Record<string, number> = {};
    stats.forEach((s: { _id: string; count: number }) => { statusMap[s._id] = s.count; });
    res.json({ total, ...statusMap });
  } catch (error) {
    console.error('[job-applications] GET /stats failed:', error);
    res.status(500).json({ message: 'Erreur lors du calcul des statistiques' });
  }
});

/* -------------------------------------------------------------------------
 * Dépôt d'une candidature (public).
 * Crée : pièces jointes -> fiche candidat (upsert par email) -> candidature.
 * ----------------------------------------------------------------------- */
router.post('/',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
  ]),
  async (req: Request, res: Response) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;

    try {
      for (const validator of validateApplication) {
        await validator.run(req);
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        removeUploadedFiles(files); // ne pas laisser de fichiers orphelins
        return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
      }

      const cvFile = files?.['cv']?.[0];
      const coverLetterFile = files?.['coverLetter']?.[0];
      const certFiles = files?.['certificates'] || [];

      if (!cvFile) {
        removeUploadedFiles(files);
        return res.status(400).json({ message: 'Le CV est obligatoire (PDF, DOC ou DOCX)' });
      }

      // 1. Enregistrer les pièces jointes dans la collection dédiée
      const attachments: Array<{ filename: string; originalName: string; url: string; type: AttachmentType; size: number; mimeType: string }> = [];
      attachments.push({
        filename: cvFile.filename,
        originalName: cvFile.originalname,
        url: '/uploads/applications/' + cvFile.filename,
        type: 'cv',
        size: cvFile.size,
        mimeType: cvFile.mimetype,
      });
      if (coverLetterFile) {
        attachments.push({
          filename: coverLetterFile.filename,
          originalName: coverLetterFile.originalname,
          url: '/uploads/applications/' + coverLetterFile.filename,
          type: 'coverLetter',
          size: coverLetterFile.size,
          mimeType: coverLetterFile.mimetype,
        });
      }
      for (const cert of certFiles) {
        attachments.push({
          filename: cert.filename,
          originalName: cert.originalname,
          url: '/uploads/applications/' + cert.filename,
          type: 'certificate',
          size: cert.size,
          mimeType: cert.mimetype,
        });
      }

      const savedAttachments = await Attachment.insertMany(attachments);

      // 2. Récupérer (ou créer) la fiche candidat via l'email
      const candidate = await Candidate.findOneAndUpdate(
        { email: req.body.email.toLowerCase().trim() },
        {
          $set: {
            lastName: req.body.lastName,
            firstName: req.body.firstName,
            phone: req.body.phone,
            address: req.body.address || '',
            education: req.body.education,
            experience: req.body.experience || '',
          },
          $setOnInsert: { email: req.body.email.toLowerCase().trim() },
        },
        { new: true, upsert: true }
      );

      // 3. Lier l'offre d'emploi si fournie et existante
      let jobOfferId: string | undefined;
      if (req.body.jobOfferId) {
        const offer = await JobOffer.findById(req.body.jobOfferId);
        if (!offer) {
          removeUploadedFiles(files);
          await Attachment.deleteMany({ _id: { $in: savedAttachments.map((a) => a._id) } });
          return res.status(400).json({ message: 'L\'offre d\'emploi sélectionnée n\'existe plus' });
        }
        jobOfferId = offer._id.toString();
      }

      // 4. Créer la candidature liée au candidat
      const application = new JobApplication({
        candidate: candidate._id,
        lastName: candidate.lastName,
        firstName: candidate.firstName,
        email: candidate.email,
        phone: candidate.phone,
        position: req.body.position,
        education: req.body.education,
        experience: req.body.experience || '',
        address: req.body.address || '',
        motivationMessage: req.body.motivationMessage || '',
        attachments: savedAttachments.map((a) => a._id),
        status: 'new',
        statusHistory: [{ status: 'new', changedAt: new Date() }],
        jobOffer: jobOfferId,
      });

      await application.save();

      // 5. Notifications par email (en arrière-plan, sans bloquer la réponse)
      sendJobConfirmation(application.email, application.firstName).catch(() => {});
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        sendNewApplicationAlert(adminEmail, application).catch(() => {});
      }

      const populated = await application.populate(populates());
      res.status(201).json(populated);
    } catch (error: unknown) {
      console.error('[job-applications] POST failed:', error);
      removeUploadedFiles(files);
      res.status(400).json({ message: 'Erreur lors de l\'envoi de la candidature' });
    }
  }
);

/* -------------------------------------------------------------------------
 * Détail d'une candidature — admin uniquement.
 * ----------------------------------------------------------------------- */
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const app = await JobApplication.findById(req.params.id).populate(populates());
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    res.json(app);
  } catch (error) {
    console.error('[job-applications] GET /:id failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de la candidature' });
  }
});

/* -------------------------------------------------------------------------
 * Téléchargement sécurisé d'une pièce jointe.
 * Authentification via header Bearer OU paramètre ?token= (liens direct).
 * ----------------------------------------------------------------------- */
router.get('/:id/attachments/:attId', async (req: Request, res: Response) => {
  try {
    const headerToken = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : undefined;
    const queryToken = typeof req.query.token === 'string' ? req.query.token : undefined;
    const token = headerToken || queryToken;

    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    try {
      jwt.verify(token, getSecret());
    } catch {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const app = await JobApplication.findById(req.params.id).populate('attachments');
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });

    const attachments = app.attachments as unknown as IAttachment[];
    const attachment = attachments.find((a) => a._id.toString() === req.params.attId);
    if (!attachment) return res.status(404).json({ message: 'Pièce jointe introuvable' });

    const filePath = path.resolve(uploadsDir, attachment.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier introuvable sur le serveur' });
    }

    res.download(filePath, attachment.originalName);
  } catch (error) {
    console.error('[job-applications] download failed:', error);
    res.status(500).json({ message: 'Erreur lors du téléchargement' });
  }
});

/* -------------------------------------------------------------------------
 * Mise à jour : changement de statut + notes internes — admin uniquement.
 * ----------------------------------------------------------------------- */
router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const app = await JobApplication.findById(req.params.id);
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });

    const update: Record<string, unknown> = {};
    const push: Record<string, unknown> = {};

    // Changement de statut (avec historique)
    if (req.body.status && typeof req.body.status === 'string') {
      const newStatus = req.body.status as ApplicationStatus;
      if (APPLICATION_STATUSES.includes(newStatus) && newStatus !== app.status) {
        update.status = newStatus;
        push.statusHistory = {
          status: newStatus,
          changedAt: new Date(),
          note: req.body.note && typeof req.body.note === 'string' ? sanitize(req.body.note) : undefined,
        };
      }
    }

    // Planification d'un entretien (date + heure obligatoires, lieu ou lien selon le type)
    const hasInterviewData = ['interviewDate', 'interviewTime', 'interviewType', 'interviewLocation', 'interviewLink', 'interviewNotes']
      .some((f) => req.body[f] !== undefined);
    if (hasInterviewData) {
      const interviewType: 'presentiel' | 'en_ligne' = req.body.interviewType === 'en_ligne' ? 'en_ligne' : 'presentiel';
      const interviewDate = sanitize(String(req.body.interviewDate || ''));
      const interviewTime = sanitize(String(req.body.interviewTime || ''));
      if (!interviewDate || !interviewTime) {
        return res.status(400).json({ message: 'La date et l\'heure de l\'entretien sont obligatoires' });
      }
      const interviewLocation = interviewType === 'presentiel' ? sanitize(String(req.body.interviewLocation || '')) : '';
      const interviewLink = interviewType === 'en_ligne' ? sanitize(String(req.body.interviewLink || '')) : '';
      if (interviewType === 'presentiel' && !interviewLocation) {
        return res.status(400).json({ message: 'Le lieu de l\'entretien est obligatoire' });
      }
      if (interviewType === 'en_ligne' && !interviewLink) {
        return res.status(400).json({ message: 'Le lien de la réunion est obligatoire' });
      }
      const interviewNotes = sanitize(String(req.body.interviewNotes || ''));
      update.interview = {
        date: interviewDate,
        time: interviewTime,
        type: interviewType,
        location: interviewLocation,
        link: interviewLink,
        notes: interviewNotes,
        scheduledAt: new Date(),
      };
      if (app.status !== 'interview') {
        update.status = 'interview';
      }
      push.statusHistory = {
        status: 'interview',
        changedAt: new Date(),
        note: interviewNotes ? `Entretien planifié — ${interviewNotes}` : 'Entretien planifié',
      };
    }

    // Ajout d'une note interne
    if (req.body.note && typeof req.body.note === 'string') {
      const noteText = sanitize(req.body.note);
      if (noteText) {
        push.notes = {
          text: noteText,
          addedBy: 'Administrateur',
          createdAt: new Date(),
        };
      }
    }

    if (Object.keys(push).length > 0) {
      update.$push = push;
    }

    const updated = await JobApplication.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate(populates());
    if (!updated) return res.status(404).json({ message: 'Candidature introuvable' });

    // Emails automatiques selon le nouveau statut (en arrière-plan, sans bloquer la réponse)
    if (updated) {
      if (updated.status === 'accepted' && app.status !== 'accepted') {
        sendApplicationAccepted(updated.email, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          position: updated.position,
        }).catch(() => {});
      } else if (updated.status === 'rejected' && app.status !== 'rejected') {
        sendApplicationRejected(updated.email, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          position: updated.position,
        }).catch(() => {});
      } else if (updated.status === 'interview' && updated.interview && req.body.sendInterviewEmail) {
        sendInterviewInvitation(updated.email, {
          firstName: updated.firstName,
          lastName: updated.lastName,
          position: updated.position,
          date: updated.interview.date,
          time: updated.interview.time,
          type: updated.interview.type,
          location: updated.interview.location,
          link: updated.interview.link,
          notes: updated.interview.notes,
        }).catch(() => {});
      }
    }

    res.json(updated);
  } catch (error) {
    console.error('[job-applications] PUT failed:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour' });
  }
});

/* -------------------------------------------------------------------------
 * Suppression (candidature + pièces jointes + fichiers) — admin uniquement.
 * ----------------------------------------------------------------------- */
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const app = await JobApplication.findById(req.params.id).populate('attachments');
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });

    const attachments = app.attachments as unknown as IAttachment[];

    // Supprimer les fichiers du disque
    for (const att of attachments) {
      try {
        const filePath = path.resolve(uploadsDir, att.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch {
        // continuer malgré un fichier déjà absent
      }
    }

    // Supprimer les documents pièces jointes
    const attIds = attachments.map((a) => a._id);
    if (attIds.length > 0) {
      await Attachment.deleteMany({ _id: { $in: attIds } });
    }

    // Supprimer la candidature
    await JobApplication.findByIdAndDelete(req.params.id);

    // Si le candidat n'a plus aucune candidature, on nettoie sa fiche
    const remaining = await JobApplication.countDocuments({ candidate: app.candidate });
    if (remaining === 0) {
      await Candidate.findByIdAndDelete(app.candidate);
    }

    res.json({ message: 'Candidature supprimée' });
  } catch (error) {
    console.error('[job-applications] DELETE failed:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

/* -------------------------------------------------------------------------
 * Gestion centralisée des erreurs multer (fichier trop gros, type refusé...)
 * ----------------------------------------------------------------------- */
router.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Le fichier ne doit pas dépasser 15 Mo'
      : 'Erreur lors de l\'envoi des fichiers. Veuillez réessayer.';
    return res.status(413).json({ message });
  }
  if (err instanceof Error) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export default router;
