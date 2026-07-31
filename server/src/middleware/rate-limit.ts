import { Request, Response, NextFunction } from 'express';

/**
 * Rate limiting en mémoire (sans dépendance externe) : protège les endpoints
 * sensibles (connexion, vérification 2FA) contre les attaques par force brute.
 * Les compteurs sont nettoyés périodiquement pour éviter toute fuite mémoire.
 */

interface RateEntry {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, RateEntry>();

// Nettoyage des entrées expirées toutes les 60 s
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of buckets) {
    if (entry.resetAt <= now) buckets.delete(key);
  }
}, 60_000);

export const rateLimit = (options: {
  windowMs: number;
  max: number;
  message: string;
}) => {
  const { windowMs, max, message } = options;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = `${req.ip}:${req.originalUrl}`;
    const now = Date.now();
    const entry = buckets.get(key);

    if (!entry || entry.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count += 1;
    if (entry.count > max) {
      res.status(429).json({ message });
      return;
    }

    next();
  };
};
