import { Router, Request, Response } from 'express';
import AvailableDate from '../models/AvailableDate.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const dates = await AvailableDate.find({ date: { $gte: new Date() } }).sort({ date: 1 });
    res.json(dates);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available dates', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const existing = await AvailableDate.findOne({ date: req.body.date });
    if (existing) {
      return res.status(409).json({ message: 'Date already available' });
    }
    const availableDate = new AvailableDate(req.body);
    await availableDate.save();
    res.status(201).json(availableDate);
  } catch (error) {
    res.status(400).json({ message: 'Error creating available date', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const date = await AvailableDate.findByIdAndDelete(req.params.id);
    if (!date) return res.status(404).json({ message: 'Available date not found' });
    res.json({ message: 'Available date deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting available date', error });
  }
});

export default router;
