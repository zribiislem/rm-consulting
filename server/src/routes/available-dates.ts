import { Router, Request, Response } from 'express';
import AvailableDate, { generateSlots } from '../models/AvailableDate.js';
import Appointment from '../models/Appointment.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const dates = await AvailableDate.find({ date: { $gte: today } }).sort({ date: 1 });

    const dateStrings = dates.map(d => d.date);
    const bookedAppointments = await Appointment.find({
      date: { $in: dateStrings },
      status: { $in: ['pending', 'confirmed'] }
    }).select('date timeSlot status');

    const bookedMap: Record<string, string[]> = {};
    bookedAppointments.forEach(a => {
      if (!bookedMap[a.date]) bookedMap[a.date] = [];
      bookedMap[a.date].push(a.timeSlot);
    });

    const result = dates.map(d => {
      const slots = generateSlots(d.startTime, d.endTime);
      return {
        _id: d._id,
        date: d.date,
        startTime: d.startTime,
        endTime: d.endTime,
        timeSlots: slots,
        bookedSlots: bookedMap[d.date.split('T')[0]] || [],
      };
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching available dates', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { date, startTime, endTime, timeSlots } = req.body;
    const sTime = startTime || '08:00';
    const eTime = endTime || '18:00';
    const slots = timeSlots || generateSlots(sTime, eTime);

    const existing = await AvailableDate.findOne({ date });
    if (existing) {
      existing.startTime = sTime;
      existing.endTime = eTime;
      existing.timeSlots = slots;
      await existing.save();
      return res.status(200).json({ ...existing.toObject(), timeSlots: slots });
    }

    const availableDate = new AvailableDate({ date, startTime: sTime, endTime: eTime, timeSlots: slots });
    await availableDate.save();
    res.status(201).json({ ...availableDate.toObject(), timeSlots: slots });
  } catch (error) {
    res.status(400).json({ message: 'Error creating available date', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { startTime, endTime, timeSlots } = req.body;
    const updateData: any = {};
    if (startTime) updateData.startTime = startTime;
    if (endTime) updateData.endTime = endTime;
    if (timeSlots) {
      updateData.timeSlots = timeSlots;
    } else if (startTime || endTime) {
      const date = await AvailableDate.findById(req.params.id);
      if (!date) return res.status(404).json({ message: 'Available date not found' });
      updateData.timeSlots = generateSlots(
        startTime || date.startTime,
        endTime || date.endTime
      );
    }

    const date = await AvailableDate.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!date) return res.status(404).json({ message: 'Available date not found' });
    res.json(date);
  } catch (error) {
    res.status(400).json({ message: 'Error updating available date', error });
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
