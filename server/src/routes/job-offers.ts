import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import JobOffer, { OFFER_STATUSES, OfferStatus } from '../models/JobOffer.js';

const router = Router();

/* Nettoyage anti-injection HTML (rendu React + emails échappés côté rendu) */
const sanitize = (value: string): string =>
  value
    .replace(/[<>]/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '')
    .trim();

const listToArray = (value: string): string[] =>
  (value || '')
    .split('\n')
    .map((s) => sanitize(s))
    .filter(Boolean);

const validateOffer = [
  body('title').trim().notEmpty().withMessage('Le titre est requis').customSanitizer(sanitize),
  body('department').trim().notEmpty().withMessage('Le département est requis').customSanitizer(sanitize),
  body('contractType').trim().notEmpty().withMessage('Le type de contrat est requis').customSanitizer(sanitize),
  body('location').trim().notEmpty().withMessage('La localisation est requise').customSanitizer(sanitize),
  body('description').trim().notEmpty().withMessage('La description est requise').customSanitizer(sanitize),
  body('skills').isArray({ min: 1 }).withMessage('Au moins une compétence est requise'),
  body('skills.*').trim().notEmpty().withMessage('Compétence vide').customSanitizer(sanitize),
  body('missions').optional({ values: 'falsy' }).isArray(),
  body('missions.*').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('benefits').optional({ values: 'falsy' }).isArray(),
  body('benefits.*').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('profile').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('educationLevel').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('requiredExperience').optional({ values: 'falsy' }).trim().customSanitizer(sanitize),
  body('status').optional({ values: 'falsy' }).isIn(OFFER_STATUSES).withMessage('Statut invalide'),
  body('publishedAt').optional({ values: 'falsy' }).isISO8601().withMessage('Date de publication invalide'),
  body('applicationDeadline').optional({ values: 'falsy' }).isISO8601().withMessage('Date d\'expiration invalide'),
  body('openPositions').optional({ values: 'falsy' }).isInt({ min: 0 }).withMessage('Nombre de postes invalide'),
];

/** Prépare le corps d'offre pour l'enregistrement (normalisation + statuts cohérents). */
const prepareOfferBody = (raw: Record<string, unknown>): Record<string, unknown> => {
  const body: Record<string, unknown> = { ...raw };

  // Conversion des listes ligne-par-ligne si elles arrivent en texte
  if (typeof raw.skills === 'string') body.skills = listToArray(raw.skills);
  if (typeof raw.missions === 'string') body.missions = listToArray(raw.missions);
  if (typeof raw.benefits === 'string') body.benefits = listToArray(raw.benefits);

  // Statut par défaut : brouillon
  if (!body.status || !OFFER_STATUSES.includes(body.status as OfferStatus)) {
    body.status = 'draft';
  }

  // Date de publication : au passage en "published", on fixe la date si absente
  if (body.status === 'published') {
    if (!body.publishedAt) body.publishedAt = new Date();
  } else if (body.publishedAt) {
    body.publishedAt = undefined;
  }

  if (body.openPositions === '' || body.openPositions === null || body.openPositions === undefined) {
    body.openPositions = undefined;
  }
  if (body.applicationDeadline === '' || body.applicationDeadline === null) {
    body.applicationDeadline = undefined;
  }

  return body;
};

/* Liste complète des offres avec recherche et filtres — admin uniquement */
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { search, department, contractType, status } = req.query;
    const filter: Record<string, unknown> = {};

    if (search && typeof search === 'string') {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { location: searchRegex },
      ];
    }
    if (department && typeof department === 'string') filter.department = department;
    if (contractType && typeof contractType === 'string') filter.contractType = contractType;
    if (status && typeof status === 'string' && OFFER_STATUSES.includes(status as OfferStatus)) {
      filter.status = status;
    }

    const offers = await JobOffer.find(filter).sort({ createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('[job-offers] GET / failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des offres' });
  }
});

/* Offres publiées et non expirées — public (site candidat) */
router.get('/active', async (_req: Request, res: Response) => {
  try {
    const offers = await JobOffer.find({
      status: 'published',
      $or: [{ applicationDeadline: { $gte: new Date() } }, { applicationDeadline: { $exists: false } }, { applicationDeadline: null }],
    }).sort({ publishedAt: -1, createdAt: -1 });
    res.json(offers);
  } catch (error) {
    console.error('[job-offers] GET /active failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement des offres' });
  }
});

/* Détail d'une offre publiée — public (page "Voir l'offre") */
router.get('/public/:id', async (req: Request, res: Response) => {
  try {
    const offer = await JobOffer.findOne({
      _id: req.params.id,
      status: 'published',
      $or: [{ applicationDeadline: { $gte: new Date() } }, { applicationDeadline: { $exists: false } }, { applicationDeadline: null }],
    });
    if (!offer) return res.status(404).json({ message: 'Offre introuvable ou non publiée' });
    res.json(offer);
  } catch (error) {
    console.error('[job-offers] GET /public/:id failed:', error);
    res.status(500).json({ message: 'Erreur lors du chargement de l\'offre' });
  }
});

router.post('/', authenticate, validateOffer, async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation échouée', errors: errors.array() });
  }
  try {
    const offer = new JobOffer(prepareOfferBody(req.body));
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
    const offer = await JobOffer.findByIdAndUpdate(
      req.params.id,
      prepareOfferBody(req.body),
      { new: true, runValidators: true }
    );
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });
    res.json(offer);
  } catch (error) {
    console.error('[job-offers] PUT failed:', error);
    res.status(400).json({ message: 'Erreur lors de la modification' });
  }
});

/* Activer / désactiver une offre : publiée <-> fermée */
router.patch('/:id/toggle', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const offer = await JobOffer.findById(req.params.id);
    if (!offer) return res.status(404).json({ message: 'Offre introuvable' });

    offer.status = offer.status === 'published' ? 'closed' : 'published';
    if (offer.status === 'published' && !offer.publishedAt) {
      offer.publishedAt = new Date();
    }
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
