import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rate-limit.js';
import { sendVerificationCode, sendPasswordResetCode } from '../services/email.js';
import Admin from '../models/Admin.js';

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

/** Accepte l'adresse admin ou l'adresse SMTP (les deux peuvent servir d'identifiant). */
const isAdminEmail = (value: string): boolean => {
  const normalized = (value || '').toLowerCase().trim();
  const adminEmail = getAdminEmail();
  const smtpUser = (process.env.SMTP_USER || '').toLowerCase().trim();
  return normalized === adminEmail || (!!smtpUser && normalized === smtpUser);
};

const getPasswordHash = async (): Promise<string> => {
  if (passwordHash) return passwordHash;
  passwordHash = await bcrypt.hash(getAdminPassword(), 12);
  return passwordHash;
};

const CODE_EXPIRY_MS = 5 * 60 * 1000;
const verificationCodes = new Map<string, { code: string; expiresAt: number }>();
const resetCodes = new Map<string, { code: string; expiresAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, value] of verificationCodes) {
    if (value.expiresAt <= now) verificationCodes.delete(key);
  }
  for (const [key, value] of resetCodes) {
    if (value.expiresAt <= now) resetCodes.delete(key);
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

    if (!isAdminEmail(email)) {
      res.status(401).json({ message: 'Email ou mot de passe incorrect.' });
      return;
    }

    // Si un mot de passe réinitialisé existe (document Admin), il a priorité sur le mot de passe du .env
    let isMatch = false;
    try {
      const admin = await Admin.findOne({ email: adminEmail });
      if (admin) {
        isMatch = await bcrypt.compare(password, admin.password);
      }
    } catch {
      isMatch = false;
    }
    if (!isMatch) {
      const hash = await getPasswordHash();
      isMatch = await bcrypt.compare(password, hash);
    }
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

/** Demande un code de réinitialisation de mot de passe. */
router.post('/forgot-password',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives. Réessayez dans 15 minutes.' }),
  async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const adminEmail = getAdminEmail();
    const lookupKey = (email || '').toLowerCase().trim();
    console.log(`[Reset] forgot-password request received for "${lookupKey}" (adminEmail="${adminEmail}")`);

    // Toujours répondre la même chose pour ne pas révéler l'existence d'un compte.
    if (lookupKey && isAdminEmail(lookupKey)) {
      const code = crypto.randomInt(100_000, 999_999).toString();
      const recipientEmail = process.env.SMTP_USER || adminEmail;
      resetCodes.set(lookupKey, {
        code,
        expiresAt: Date.now() + CODE_EXPIRY_MS,
      });

      sendPasswordResetCode(recipientEmail, code).catch((err) =>
        console.error('[Reset] Background email send failed:', err)
      );
    }

    res.json({ message: 'Si cette adresse est associée à un compte, un code de réinitialisation vous a été envoyé par email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

/** Vérifie le code et enregistre un nouveau mot de passe. */
router.post('/reset-password',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: 'Trop de tentatives. Réessayez dans 15 minutes.' }),
  async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    const lookupKey = (email || '').toLowerCase().trim();

    if (!lookupKey || !code || !newPassword) {
      res.status(400).json({ message: 'Email, code et nouveau mot de passe requis.' });
      return;
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      res.status(400).json({ message: 'Le nouveau mot de passe doit contenir au moins 8 caractères.' });
      return;
    }

    const stored = resetCodes.get(lookupKey);
    if (!stored) {
      res.status(401).json({ message: 'Code invalide ou expiré. Veuillez redemander un code.' });
      return;
    }

    if (Date.now() > stored.expiresAt) {
      resetCodes.delete(lookupKey);
      res.status(401).json({ message: 'Code expiré. Veuillez redemander un code.' });
      return;
    }

    if (stored.code !== code.trim()) {
      res.status(401).json({ message: 'Code incorrect.' });
      return;
    }

    resetCodes.delete(lookupKey);

    const adminEmail = getAdminEmail();
    let admin = await Admin.findOne({ email: adminEmail });
    if (admin) {
      admin.password = newPassword;
      await admin.save();
    } else {
      await Admin.create({ email: adminEmail, password: newPassword, name: ADMIN_NAME });
    }

    res.json({ message: 'Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'Erreur serveur.' });
  }
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
