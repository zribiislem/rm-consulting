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

router.get('/', async (_req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find().sort({ createdAt: -1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const { date, timeSlot } = req.body;
    if (date && timeSlot) {
      const existing = await Appointment.findOne({
        date,
        timeSlot,
        status: { $in: ['pending', 'confirmed'] }
      });
      if (existing) {
        return res.status(409).json({ message: 'Ce créneau horaire est déjà réservé.' });
      }
    }
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ message: 'Error creating appointment', error });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    if (req.body.status === 'cancelled' && req.body.rejectionReason) {
      try {
        const info = await getTransporter().sendMail({
          from: `"RM Consulting" <${process.env.SMTP_USER || 'noreply@rm-consulting.tn'}>`,
          to: appointment.email,
          subject: 'Rendez-vous refusé - RM Consulting',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #6c0042; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">RM Consulting</h2>
                <p style="margin: 5px 0 0; opacity: 0.8; font-size: 12px;">Expertise & Audit</p>
              </div>
              <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 14px;">Bonjour ${appointment.clientName},</p>
                <p style="color: #333; font-size: 14px;">Nous vous informons que votre demande de rendez-vous a été refusée.</p>
                <div style="background: white; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #333; font-size: 14px; margin: 0 0 8px 0;"><strong>Détails du rendez-vous :</strong></p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Date : ${appointment.date}</p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Créneau : ${appointment.timeSlot}</p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Sujet : ${appointment.subject || 'Non spécifié'}</p>
                </div>
                <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #333; font-size: 14px; margin: 0 0 5px 0;"><strong>Raison du refus :</strong></p>
                  <p style="color: #555; font-size: 13px; margin: 0; line-height: 1.6;">${req.body.rejectionReason.replace(/\n/g, '<br>')}</p>
                </div>
                <p style="color: #333; font-size: 14px;">N'hésitez pas à nous recontacter pour toute question.</p>
                <p style="color: #999; font-size: 11px; margin-top: 20px;">
                  Ce message a été envoyé depuis le tableau de bord RM Consulting.<br>
                  Avenue de l'Indépendance, Les Berges du Lac 2, Tunis, Tunisie<br>
                  +216 71 000 000 | contact@rm-consulting.tn
                </p>
              </div>
            </div>
          `,
        });
        console.log(`Rejection email sent to ${appointment.email}: ${info.messageId}`);
      } catch (emailError: any) {
        console.error('Failed to send rejection email:', emailError.message);
      }
    }

    if (req.body.status === 'rescheduled' && req.body.rescheduledDate && req.body.rescheduledTimeSlot) {
      try {
        const newDateFormatted = new Date(appointment.rescheduledDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
        const info = await getTransporter().sendMail({
          from: `"RM Consulting" <${process.env.SMTP_USER || 'noreply@rm-consulting.tn'}>`,
          to: appointment.email,
          subject: 'Rendez-vous reporté - RM Consulting',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: #6c0042; color: white; padding: 20px; border-radius: 10px 10px 0 0;">
                <h2 style="margin: 0;">RM Consulting</h2>
                <p style="margin: 5px 0 0; opacity: 0.8; font-size: 12px;">Expertise & Audit</p>
              </div>
              <div style="background: #f9f9f9; padding: 20px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                <p style="color: #333; font-size: 14px;">Bonjour ${appointment.clientName},</p>
                <p style="color: #333; font-size: 14px;">Votre rendez-vous a été reporté à une nouvelle date. Voici les détails :</p>
                <div style="background: white; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #333; font-size: 14px; margin: 0 0 8px 0;"><strong>Ancien rendez-vous :</strong></p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Date : ${appointment.date}</p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Créneau : ${appointment.timeSlot}</p>
                </div>
                <div style="background: white; border-left: 4px solid #10b981; padding: 15px; margin: 15px 0; border-radius: 0 8px 8px 0;">
                  <p style="color: #333; font-size: 14px; margin: 0 0 8px 0;"><strong>Nouveau rendez-vous :</strong></p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Date : ${newDateFormatted}</p>
                  <p style="color: #555; font-size: 13px; margin: 2px 0;">Créneau : ${appointment.rescheduledTimeSlot}</p>
                </div>
                <p style="color: #333; font-size: 14px;">Nous nous excusons pour ce changement et vous remercions de votre compréhension.</p>
                <p style="color: #999; font-size: 11px; margin-top: 20px;">
                  Ce message a été envoyé depuis le tableau de bord RM Consulting.<br>
                  Avenue de l'Indépendance, Les Berges du Lac 2, Tunis, Tunisie<br>
                  +216 71 000 000 | contact@rm-consulting.tn
                </p>
              </div>
            </div>
          `,
        });
        console.log(`Reschedule email sent to ${appointment.email}: ${info.messageId}`);
      } catch (emailError: any) {
        console.error('Failed to send reschedule email:', emailError.message);
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
