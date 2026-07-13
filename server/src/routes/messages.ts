import { Router, Request, Response } from 'express';
import Message from '../models/Message.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching message', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ message: 'Error creating message', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (error) {
    res.status(400).json({ message: 'Error updating message', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json({ message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting message', error });
  }
});

export default router;
