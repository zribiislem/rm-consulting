import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { sendVerificationCode } from '../services/email.js';

const router = Router();

const getSecret = (): string => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not defined');
  return secret;
};

const ADMIN_NAME = 'Rezgui Mihoub';
const ADMIN_ID = 'admin-static-id';

let passwordHash: string | null = null;

const getAdminEmail = (): string => (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
const getAdminPassword = (): string => process.env.ADMIN_PASSWORD || '';

const getPasswordHash = async (): Promise<string> => {
  if (passwordHash) return passwordHash;
  passwordHash = await bcrypt.hash(getAdminPassword(), 12);
  return passwordHash;
};

const CODE_EXPIRY_MS = 5 * 60 * 1000;
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes) {
    if (value.expiresAt <= now) verificationCodes.delete(key);
  }
}, 60_000);

const TOKEN_EXPIRY = '24h';

router.post('/login',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.' }),
  async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const adminEmail = getAdminEmail();

    if (!email || !password || !adminEmail || !getAdminPassword()) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      return;
    }

    if (email.toLowerCase().trim() !== adminEmail) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      return;
    }

    const hash = await getPasswordHash();
    const isMatch = await bcrypt.compare(password, hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      return;
    }

    const code = crypto.randomInt(100_000, 999_999).toString();
    const recipientEmail = process.env.SMTP_USER || adminEmail;
    verificationCodes.set(recipientEmail, {
      code,
      expiresAt: Date.now() + CODE_EXPIRY_MS,
    });

    sendVerificationCode(recipientEmail, code).catch((err) =>
      console.error('[2FA] Background email send failed:', err)
    );

    res.json({
      step: 'verify',
      message: 'Code de vérification envoyé par email.',
      email: recipientEmail,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/verify-2fa',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 15, message: 'Trop de tentatives. Réessayez dans 15 minutes.' }),
  async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;
    const lookupKey = (email || '').toLowerCase().trim();

    if (!lookupKey || !code) {
      res.status(400).json({ message: 'Email et code requis.' });
      return;
    }

    const stored = verificationCodes.get(lookupKey);
    if (!stored) {
      res.status(401).json({ message: 'Code invalide ou expiré.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(lookupKey);
      res.status(401).json({ message: 'Code expiré. Veuillez vous reconnecter.' });
      return;
    }

    if (stored.code !== code.trim()) {
      res.status(401).json({ message: 'Code incorrect.' });
      return;
    }

    verificationCodes.delete(lookupKey);

    const token = jwt.sign({ id: ADMIN_ID }, getSecret(), {
      expiresIn: TOKEN_EXPIRY,
    });

    res.json({
      token,
      admin: {
        id: ADMIN_ID,
        email: getAdminEmail(),
        name: ADMIN_NAME,
      },
    });
  } catch (error) {
    console.error('Verify 2FA error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

router.post('/logout', (_req: Request, res: Response) => {
  res.json({ message: 'Déconnecté avec succès.' });
});

router.get('/me', authenticate, (req: AuthRequest, res: Response) => {
  if (!req.adminId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }
  res.json({
    admin: {
      id: ADMIN_ID,
      email: getAdminEmail(),
      name: ADMIN_NAME,
    },
  });
});

export default router;
