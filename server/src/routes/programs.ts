import { Router, Response } from 'express';
import Program from '../models/Program.js';
import { authenticate, AuthRequest } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { date } = req.query;
    const filter = date ? { date: String(date) } : {};
    const programs = await Program.find(filter).sort({ date: 1, startTime: 1 });
    res.json(programs);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching programs', error });
  }
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { title, date, startTime, endTime, type } = req.body;
    if (!String(title || '').trim() || !date || !startTime || !endTime || !String(type || '').trim()) {
      return res.status(400).json({ message: 'Le titre, la date, les heures et le type sont obligatoires.' });
    }
    const program = new Program({
      title: String(title).trim(),
      description: String(req.body.description || '').trim(),
      date: String(date).slice(0, 10),
      startTime: String(startTime).slice(0, 5),
      endTime: String(endTime).slice(0, 5),
      type: String(type).trim(),
      notes: String(req.body.notes || '').trim(),
    });
    await program.save();
    res.status(201).json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error creating program', error });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, date, startTime, endTime, type, notes } = req.body;
    const updateData: Record<string, string> = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (description !== undefined) updateData.description = String(description || '').trim();
    if (date) updateData.date = String(date).slice(0, 10);
    if (startTime) updateData.startTime = String(startTime).slice(0, 5);
    if (endTime) updateData.endTime = String(endTime).slice(0, 5);
    if (type !== undefined) updateData.type = String(type).trim();
    if (notes !== undefined) updateData.notes = String(notes || '').trim();
    const program = await Program.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json(program);
  } catch (error) {
    res.status(400).json({ message: 'Error updating program', error });
  }
});

router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const program = await Program.findByIdAndDelete(req.params.id);
    if (!program) return res.status(404).json({ message: 'Program not found' });
    res.json({ message: 'Program deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting program', error });
  }
});

export default router;
