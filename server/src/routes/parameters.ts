import { Router, Request, Response } from 'express';
import Parameter from '../models/Parameter.js';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    const params = await Parameter.find().sort({ order: 1 });
    res.json(params);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des paramètres', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const param = new Parameter(req.body);
    await param.save();
    res.status(201).json(param);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const param = await Parameter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!param) return res.status(404).json({ message: 'Paramètre introuvable' });
    res.json(param);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const param = await Parameter.findByIdAndDelete(req.params.id);
    if (!param) return res.status(404).json({ message: 'Paramètre introuvable' });
    res.json({ message: 'Paramètre supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
});

export default router;