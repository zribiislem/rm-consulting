import { Router, Request, Response } from 'express';
import { body, query, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import JobApplication from '../models/JobApplication.js';
import { sendJobConfirmation, sendNewApplicationAlert } from '../services/email.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'applications');

const allowedMimes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
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
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Formats acceptés : PDF, DOC, DOCX uniquement'));
    }
  },
  limits: { fileSize: maxFileSize },
});

const router = Router();

const validateApplication = [
  body('lastName').trim().notEmpty().withMessage('Le nom est requis').escape(),
  body('firstName').trim().notEmpty().withMessage('Le prénom est requis').escape(),
  body('email').trim().isEmail().withMessage('Email invalide').normalizeEmail(),
  body('phone').trim().matches(/^[\d\s+\-().]{8,20}$/).withMessage('Téléphone invalide').escape(),
  body('position').trim().notEmpty().withMessage('Le poste est requis').escape(),
  body('education').trim().notEmpty().withMessage('La formation est requise').escape(),
  body('experience').optional().trim().escape(),
  body('address').optional().trim().escape(),
  body('motivationMessage').optional().trim().escape(),
];

router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, position, status, sortBy, sortOrder } = req.query;
    const filter: Record<string, unknown> = {};

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

    if (status && typeof status === 'string') {
      filter.status = status;
    }

    const sortField = sortBy === 'name' ? 'lastName' : sortBy === 'email' ? 'email' : 'createdAt';
    const order = sortOrder === 'asc' ? 1 : -1;

    const apps = await JobApplication.find(filter).sort({ [sortField]: order });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des candidatures', error });
  }
});

router.get('/positions', async (_req: Request, res: Response) => {
  try {
    const positions = await JobApplication.distinct('position');
    res.json(positions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await JobApplication.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const total = await JobApplication.countDocuments();
    const statusMap: Record<string, number> = {};
    stats.forEach((s: { _id: string; count: number }) => { statusMap[s._id] = s.count; });
    res.json({ total, ...statusMap });
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error });
  }
});

router.post('/',
  upload.fields([
    { name: 'cv', maxCount: 1 },
    { name: 'coverLetter', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
  ]),
  async (req: Request, res: Response) => {
    try {
      for (const validator of validateApplication) {
        await validator.run(req);
      }
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      const cvFile = files?.['cv']?.[0];
      const coverLetterFile = files?.['coverLetter']?.[0];
      const certFiles = files?.['certificates'] || [];

      if (!cvFile) {
        return res.status(400).json({ message: 'Le CV est obligatoire (PDF, DOC ou DOCX)' });
      }

      const attachments: Array<{
        filename: string;
        originalName: string;
        url: string;
        type: 'cv' | 'coverLetter' | 'certificate';
        size: number;
      }> = [];

      attachments.push({
        filename: cvFile.filename,
        originalName: cvFile.originalname,
        url: '/uploads/applications/' + cvFile.filename,
        type: 'cv',
        size: cvFile.size,
      });

      if (coverLetterFile) {
        attachments.push({
          filename: coverLetterFile.filename,
          originalName: coverLetterFile.originalname,
          url: '/uploads/applications/' + coverLetterFile.filename,
          type: 'coverLetter',
          size: coverLetterFile.size,
        });
      }

      for (const cert of certFiles) {
        attachments.push({
          filename: cert.filename,
          originalName: cert.originalname,
          url: '/uploads/applications/' + cert.filename,
          type: 'certificate',
          size: cert.size,
        });
      }

      const application = new JobApplication({
        lastName: req.body.lastName,
        firstName: req.body.firstName,
        email: req.body.email,
        phone: req.body.phone,
        position: req.body.position,
        education: req.body.education,
        experience: req.body.experience || '',
        address: req.body.address || '',
        motivationMessage: req.body.motivationMessage || '',
        attachments,
      });

      await application.save();

      sendJobConfirmation(application.email, application.firstName).catch(() => {});
      const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
      if (adminEmail) {
        sendNewApplicationAlert(adminEmail, application).catch(() => {});
      }

      res.status(201).json(application);
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Formats acceptés : PDF, DOC, DOCX uniquement') {
        return res.status(400).json({ message: error.message });
      }
      res.status(400).json({ message: 'Erreur lors de l\'envoi de la candidature', error });
    }
  }
);

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const app = await JobApplication.findById(req.params.id).populate('jobOffer');
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Erreur', error });
  }
});

router.put('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const allowedFields = ['status', 'notes'];
    const update: Record<string, unknown> = {};

    if (req.body.status) {
      const validStatuses = ['new', 'analyzing', 'interview', 'accepted', 'rejected'];
      if (validStatuses.includes(req.body.status)) {
        update.status = req.body.status;
      }
    }

    if (req.body.note) {
      const noteText = typeof req.body.note === 'string' ? req.body.note.trim() : '';
      if (noteText) {
        update.$push = {
          notes: {
            text: noteText.replace(/[<>]/g, ''),
            addedBy: 'Administrateur',
            createdAt: new Date(),
          },
        };
      }
    }

    const app = await JobApplication.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true }
    );
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    res.json(app);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const app = await JobApplication.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });

    for (const att of app.attachments) {
      if (att.url) {
        const filePath = path.resolve(__dirname, '..', '..', att.url.replace(/^\//, ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }
    }
    res.json({ message: 'Candidature supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
});

export default router;
