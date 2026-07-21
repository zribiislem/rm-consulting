import { Router, Request, Response } from 'express';
import AvailableDate from '../models/AvailableDate.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const dates = await AvailableDate.find().sort({ date: 1 });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available dates', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const date = new AvailableDate(req.body);
    await date.save();
    res.status(201).json(date);
  } catch (error) {
    res.status(400).json({ message: 'Error creating available date', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const date = await AvailableDate.findByIdAndDelete(req.params.id);
    if (!date) return res.status(404).json({ message: 'Date not found' });
    res.json({ message: 'Date deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting date', error });
  }
});

export default router;
