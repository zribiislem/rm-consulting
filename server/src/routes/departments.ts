import { Router, Request, Response } from 'express';
import Department from '../models/Department.js';

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

router.post('/', async (req: Request, res: Response) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error creating department', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    res.status(400).json({ message: 'Error updating department', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting department', error });
  }
});

export default router;
