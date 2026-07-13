import { Router, Request, Response } from 'express';
import Mission from '../models/Mission.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const missions = await Mission.find();
    res.json(missions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching missions', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findById(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json(mission);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching mission', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const mission = new Mission(req.body);
    await mission.save();
    res.status(201).json(mission);
  } catch (error) {
    res.status(400).json({ message: 'Error creating mission', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json(mission);
  } catch (error) {
    res.status(400).json({ message: 'Error updating mission', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const mission = await Mission.findByIdAndDelete(req.params.id);
    if (!mission) return res.status(404).json({ message: 'Mission not found' });
    res.json({ message: 'Mission deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting mission', error });
  }
});

export default router;
