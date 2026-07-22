import { Router } from 'express';
import Stat from '../models/Stat';

const router = Router();

router.get('/', async (_req, res) => {
  try {
    const stats = await Stat.find().sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des statistiques' });
  }
});

export default router;
