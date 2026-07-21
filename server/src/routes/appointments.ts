import { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import Appointment from '../models/Appointment.js';

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

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('fr-TN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

async function sendStatusEmail(
  to: string,
  clientName: string,
  status: 'confirmed' | 'cancelled',
  date: Date,
  timeSlot: string,
  subject: string
) {
  const isConfirmed = status === 'confirmed';
  const statusLabel = isConfirmed ? 'Confirmé' : 'Refusé';
  const statusColor = isConfirmed ? '#16a34a' : '#dc2626';
  const borderColor = isConfirmed ? '#16a34a' : '#dc2626';
  const greeting = isConfirmed
    ? `Nous avons le plaisir de vous informer que votre demande de rendez-vous a été <strong style="color: ${statusColor};">${statusLabel}</strong>.`
    : `Nous avons le regret de vous informer que votre demande de rendez-vous a été <strong style="color: ${statusColor};">${statusLabel}</strong>.`;
  const body = isConfirmed
    ? `<p style="color: #555; font-size: 14px;">Merci pour votre confiance. Nous vous attendons à la date et heure convenues.</p>`
    : `<p style="color: #555; font-size: 14px;">Nous vous invitons à reprendre contact avec nous pour convenir d'un nouveau créneau.</p>`;

  const info = await getTransporter().sendMail({
    from: `"RM Consulting" <${process.env.SMTP_USER || 'noreply@rm-consulting.tn'}>`,
    to,
    subject: `Votre rendez-vous — ${statusLabel}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #6c0042; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
          <h2 style="margin: 0;">RM Consulting</h2>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 12px;">Expertise & Audit</p>
        </div>
        <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
          <p style="color: #333; font-size: 14px;">Bonjour ${clientName},</p>
          <p style="color: #333; font-size: 14px;">${greeting}</p>
          <div style="background: white; border-left: 4px solid ${borderColor}; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
            <p style="color: #333; font-size: 14px; margin: 0 0 8px;"><strong>Sujet :</strong> ${subject}</p>
            <p style="color: #333; font-size: 14px; margin: 0 0 8px;"><strong>Date :</strong> ${formatDate(date)}</p>
            <p style="color: #333; font-size: 14px; margin: 0;"><strong>Créneau :</strong> ${timeSlot}</p>
          </div>
          ${body}
          <p style="color: #999; font-size: 11px; margin-top: 20px;">
            Ce message a été envoyé depuis le tableau de bord RM Consulting.<br>
            Avenue de l'Indépendance, Les Berges du Lac 2, Tunis, Tunisie<br>
            +216 71 000 000 | contact@rm-consulting.tn
          </p>
        </div>
      </div>
    `,
  });

  console.log(`Email ${status} sent to ${to}: ${info.messageId}`);
}

router.get('/', async (_req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find().sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointment', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await Appointment.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Appointment not found' });

    const previousStatus = existing.status;
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (req.body.status && req.body.status !== previousStatus) {
      const newStatus = req.body.status as 'confirmed' | 'cancelled';
      if (newStatus === 'confirmed' || newStatus === 'cancelled') {
        try {
          await sendStatusEmail(
            appointment.email,
            appointment.clientName,
            newStatus,
            appointment.date,
            appointment.timeSlot,
            appointment.subject
          );
        } catch (emailError) {
          console.error('Failed to send status email:', emailError);
        }
      }
    }

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating appointment', error });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
});

export default router;
