import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Reference from '../models/Reference.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(__dirname, '..', '..', 'uploads');

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
    cb(null, 'ref-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeOk = allowed.test(file.mimetype);
    if (extOk && mimeOk) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, webp, gif)'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const refs = await Reference.find().sort({ order: 1 });
    res.json(refs);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des références', error });
  }
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const refData: Record<string, unknown> = {
      name: req.body.name,
      category: req.body.category,
      order: Number(req.body.order) || 0,
    };
    if (req.file) {
      refData.imageUrl = '/uploads/' + req.file.filename;
    }
    const ref = new Reference(refData);
    await ref.save();
    res.status(201).json(ref);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
});

router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const existing = await Reference.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Référence introuvable' });

    const updateData: Record<string, unknown> = {
      name: req.body.name,
      category: req.body.category,
      order: Number(req.body.order) || 0,
    };

    if (req.file) {
      if (existing.imageUrl) {
        const oldPath = path.resolve(__dirname, '..', '..', existing.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.imageUrl = '/uploads/' + req.file.filename;
    } else if (req.body.removeImage === 'true') {
      if (existing.imageUrl) {
        const oldPath = path.resolve(__dirname, '..', '..', existing.imageUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.imageUrl = '';
    }

    const ref = await Reference.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!ref) return res.status(404).json({ message: 'Référence introuvable' });
    res.json(ref);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const ref = await Reference.findByIdAndDelete(req.params.id);
    if (!ref) return res.status(404).json({ message: 'Référence introuvable' });
    if (ref.imageUrl) {
      const imgPath = path.resolve(__dirname, '..', '..', ref.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    res.json({ message: 'Référence supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
});

export default router;