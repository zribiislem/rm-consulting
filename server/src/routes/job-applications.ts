import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import JobApplication from '../models/JobApplication.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads', 'applications');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'app-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont acceptés'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const apps = await JobApplication.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des candidatures', error });
  }
});

router.post('/', upload.fields([
  { name: 'cv', maxCount: 1 },
  { name: 'coverLetter', maxCount: 1 },
]), async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const cvFile = files?.['cv']?.[0];
    const coverLetterFile = files?.['coverLetter']?.[0];

    if (!cvFile) {
      return res.status(400).json({ message: 'Le CV (PDF) est obligatoire' });
    }

    const appData: Record<string, unknown> = {
      lastName: req.body.lastName,
      firstName: req.body.firstName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      education: req.body.education,
      cvUrl: '/uploads/applications/' + cvFile.filename,
      experience: req.body.experience || '',
      address: req.body.address || '',
      motivationMessage: req.body.motivationMessage || '',
    };

    if (coverLetterFile) {
      appData.coverLetterUrl = '/uploads/applications/' + coverLetterFile.filename;
    }

    const application = new JobApplication(appData);
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de l\'envoi de la candidature', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const app = await JobApplication.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    res.json(app);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const app = await JobApplication.findByIdAndDelete(req.params.id);
    if (!app) return res.status(404).json({ message: 'Candidature introuvable' });
    const deleteFile = (url: string) => {
      if (url) {
        const filePath = path.resolve(__dirname, '..', '..', url);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    };
    deleteFile(app.cvUrl);
    deleteFile(app.coverLetterUrl);
    res.json({ message: 'Candidature supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
});

export default router;
