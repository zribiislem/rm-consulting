import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import JobOffer from '../models/JobOffer.js';

const router = Router();

/* Nettoyage anti-injection HTML (rendu React + emails échappés côté rendu) */
const sanitize = (value: string): string =>
  value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

const validateOffer = [
  body('title').trim().notEmpty().withMessage('Le titre est requis').customSanitizer(sanitize),
  body('department').trim().notEmpty().withMessage('Le département est requis').customSanitizer(sanitize),
  body('location').trim().notEmpty().withMessage('La localisation est requise').customSanitizer(sanitize),
  body('contractType').trim().notEmpty().withMessage('Le type de contrat est requis').customSanitizer(sanitize),
  body('description').trim().notEmpty().withMessage('La description est requise').customSanitizer(sanitize),
  body('requiredSkills').isArray({ min: 1 }).withMessage('Au moins une compétence est requise'),
  body('requiredSkills.*').trim().notEmpty().withMessage('Compétence vide').customSanitizer(sanitize),
  body('applicationDeadline').isISO8601().withMessage('Date limite invalide')
    .custom((value: string) => new Date(value).getTime() > Date.now())
    .withMessage('La date limite doit être dans le futur'),
];

/* Liste complète (offres actives et inactives) — admin uniquement */
router.get('/', authenticate, async (_req: AuthRequest, res: Response) => {
  try {
    const offers = await JobOffer.find().sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('[job-offers] GET / failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des offres' });
  }
});

/* Offres actives et non expirées — public (site candidat) */
router.get('/active', async (_req: Request, res: Response) => {
  try {
    const offers = await JobOffer.find({
      isActive: true,
      applicationDeadline: { $gte: new Date() },
    }).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('[job-offers] GET /active failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des offres' });
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
    console.error('[job-offers] POST failed:', error);
    res.status(400).json({ message: 'Erreur lors de la création' });
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
    console.error('[job-offers] PUT failed:', error);
    res.status(400).json({ message: 'Erreur lors de la modification' });
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
    console.error('[job-offers] PATCH toggle failed:', error);
    res.status(400).json({ message: 'Erreur lors de la mise à jour' });
  }
});

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await JobOffer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });
    res.json({ message: 'Offre supprimée' });
  } catch (error) {
    console.error('[job-offers] DELETE failed:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression' });
  }
});

export default router;
