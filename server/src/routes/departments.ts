import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Department from '../models/Department.js';

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
    cb(null, 'dept-' + uniqueSuffix + ext);
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
    const departments = await Department.find();
    res.json(departments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching departments', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching department', error });
  }
});

router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const deptData: Record<string, unknown> = {
      name: req.body.name,
      description: req.body.description,
      head: req.body.head,
      staffCount: Number(req.body.staffCount) || 0,
      activeProjects: Number(req.body.activeProjects) || 0,
      services: req.body.services ? JSON.parse(req.body.services) : [],
    };

    if (req.file) {
      deptData.imageUrl = '/uploads/' + req.file.filename;
    }

    const department = new Department(deptData);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error });
  }
});

router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const existing = await Department.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Department not found' });

    const updateData: Record<string, unknown> = {
      name: req.body.name,
      description: req.body.description,
      head: req.body.head,
      staffCount: Number(req.body.staffCount) || 0,
      activeProjects: Number(req.body.activeProjects) || 0,
      services: req.body.services ? JSON.parse(req.body.services) : [],
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

    const department = await Department.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    if (department.imageUrl) {
      const imgPath = path.resolve(__dirname, '..', '..', department.imageUrl);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
});

export default router;
