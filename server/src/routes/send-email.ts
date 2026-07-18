import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';

const router = Router();

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

router.post('/', async (req: Request, res: Response) => {
  const { to, subject, text, senderName } = req.body;

  if (!to || !subject || !text) {
    return res.status(400).json({ message: 'Missing required fields: to, subject, text' });
  }

  try {
    const info = await getTransporter().sendMail({
      from: `"RM Consulting" <${process.env.SMTP_USER || 'noreply@rm-consulting.tn'}>`,
      to,
      subject,
      text,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #6c0042; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
            <h2 style="margin: 0;">RM Consulting</h2>
            <p style="margin: 5px 0 0; opacity: 0.8; font-size: 12px;">Expertise & Audit</p>
          </div>
          <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <p style="color: #333; font-size: 14px;">Bonjour,</p>
            <p style="color: #333; font-size: 14px;">${senderName || 'Marc-Antoine Durand'} vous a répondu depuis votre espace client RM Consulting :</p>
            <div style="background: white; border-left: 4px solid #6c0042; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
              <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">${text.replace(/\n/g, '<br>')}</p>
            </div>
            <p style="color: #999; font-size: 11px; margin-top: 20px;">
              Ce message a été envoyé depuis le tableau de bord RM Consulting.<br>
              Avenue de l'Indépendance, Les Berges du Lac 2, Tunis, Tunisie<br>
              +216 71 000 000 | contact@rm-consulting.tn
            </p>
          </div>
        </div>
      `,
    });

    console.log(`Email sent to ${to}: ${info.messageId}`);
    res.json({ success: true, messageId: info.messageId });
  } catch (error: any) {
    console.error('Email send error:', error);
    res.status(500).json({ message: 'Failed to send email', error: error.message });
  }
});

export default router;
