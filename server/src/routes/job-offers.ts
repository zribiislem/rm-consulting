import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import JobOffer from '../models/JobOffer.js';

const router = Router();

const validateOffer = [
  body('title').trim().notEmpty().withMessage('Le titre est requis'),
  body('department').trim().notEmpty().withMessage('Le département est requis'),
  body('location').trim().notEmpty().withMessage('La localisation est requise'),
  body('contractType').trim().notEmpty().withMessage('Le type de contrat est requis'),
  body('description').trim().notEmpty().withMessage('La description est requise'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('Au moins une compétence est requise'),
  body('applicationDeadline').isISO8601().withMessage('Date limite invalide'),
];

router.get('/', async (_req: Request, res: Response) => {
  try {
    const offers = await JobOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des offres', error });
  }
});

router.get('/active', async (_req: Request, res: Response) => {
  try {
    const offers = await JobOffer.find({ isActive: true, applicationDeadline: { $gte: new Date() } }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors du chargement des offres', error });
  }
});

router.post('/', authenticate, validateOffer, async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
  }
  try {
    const offer = new JobOffer(req.body);
    await offer.save();
    res.status(201).json(offer);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
});

router.put('/:id', authenticate, validateOffer, async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
  }
  try {
    const offer = await JobOffer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error });
  }
});

router.patch('/:id/toggle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await JobOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });
    offer.isActive = !offer.isActive;
    await offer.save();
    res.json(offer);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await JobOffer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });
    res.json({ message: 'Offre supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error });
  }
});

export default router;
