import nodemailer from 'nodemailer';

/** Échappe les valeurs insérées dans les templates HTML (protection XSS email). */
const esc = (value: unknown): string =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Convertit une heure au format 24h ("14:30") en format 12h avec AM/PM ("2:30 PM"). */
const formatTimeAmPm = (time: string): string => {
  const [h, m] = time.split(':').map(Number);
  if (Number.isNaN(h)) return time;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  const minutes = Number.isNaN(m) ? 0 : m;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
};

const createTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !port || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: parseInt(port, 10),
    secure: parseInt(port, 10) === 465,
    requireTLS: true,
    auth: { user, pass },
  });
};

export async function sendVerificationCode(email: string, code: string): Promise<void> {
  console.log(`[2FA] Verification code for ${email}: ${code}`);

  const transporter = createTransporter();

  if (!transporter) {
    console.log('[2FA] SMTP not configured. Code available above in console.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"RM Consulting" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Code de vérification - RM Consulting',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #6c0042; margin: 0;">RM Consulting</h2>
            <p style="color: #554249; font-size: 14px; margin: 4px 0 0;">Portail d'Administration Interne</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
            <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour,</p>
            <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
              Veuillez utiliser le code ci-dessous pour finaliser votre connexion :
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6c0042; background: #f3eef0; padding: 16px; border-radius: 8px;">
                ${code}
              </div>
            </div>
            <p style="color: #877179; font-size: 13px; margin: 0;">
              Ce code expire dans 5 minutes. Si vous n'êtes pas à l'origine de cette tentative, ignorez cet email.
            </p>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <p style="color: #877179; font-size: 11px; margin: 0;">RM Consulting © ${new Date().getFullYear()} — Système sécurisé</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[2FA] Failed to send email:', err);
  }
}

/** Code de réinitialisation de mot de passe envoyé à l'administrateur. */
export async function sendPasswordResetCode(email: string, code: string): Promise<void> {
  console.log(`[Reset] Password reset code for ${email}: ${code}`);

  const transporter = createTransporter();

  if (!transporter) {
    console.log('[Reset] SMTP not configured. Code available above in console.');
    return;
  }

  try {
    await transporter.sendMail({
      from: `"RM Consulting" <${process.env.SMTP_USER}>`,
      to: email,
      subject: 'Réinitialisation de mot de passe - RM Consulting',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="color: #6c0042; margin: 0;">RM Consulting</h2>
            <p style="color: #554249; font-size: 14px; margin: 4px 0 0;">Portail d'Administration Interne</p>
          </div>
          <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
            <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour,</p>
            <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
              Vous avez demandé la réinitialisation de votre mot de passe. Utilisez le code ci-dessous :
            </p>
            <div style="text-align: center; margin: 24px 0;">
              <div style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #6c0042; background: #f3eef0; padding: 16px; border-radius: 8px;">
                ${code}
              </div>
            </div>
            <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
              Après vérification du code, vous pourrez définir un nouveau mot de passe.
            </p>
            <p style="color: #877179; font-size: 13px; margin: 0;">
              Ce code expire dans 5 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email et votre mot de passe restera inchangé.
            </p>
          </div>
          <div style="text-align: center; margin-top: 16px;">
            <p style="color: #877179; font-size: 11px; margin: 0;">RM Consulting © ${new Date().getFullYear()} — Système sécurisé</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[Reset] Failed to send email:', err);
  }
}

const tplHeader = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px;">
    <div style="text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #C8A96A;">
      <h2 style="color: #6c0042; margin: 0;">RM Consulting</h2>
      <p style="color: #735b24; font-size: 13px; margin: 4px 0 0;">Expertise Comptable & Audit</p>
    </div>
`;

const tplFooter = `
    <div style="text-align: center; margin-top: 24px; padding-top: 16px; border-top: 1px solid #dac0c8;">
      <p style="color: #877179; font-size: 11px; margin: 0;">RM Consulting © ${new Date().getFullYear()} — www.rm-consulting.tn</p>
    </div>
  </div>
`;

interface SimpleJobApp {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
}

export async function sendJobConfirmation(to: string, firstName: string): Promise<void> {
  console.log(`[Recruitment] Confirmation email for ${to}`);
  const transporter = createTransporter();
  if (!transporter) { return; }

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to,
      subject: 'Confirmation de réception - Candidature RM Consulting',
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour <strong>${esc(firstName)}</strong>,</p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Nous vous remercions pour l'intérêt que vous portez à RM Consulting.
          </p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Votre candidature a bien été reçue par notre équipe RH. Nous l'étudierons avec la plus grande attention et vous recontacterons si votre profil correspond à nos besoins.
          </p>
          <div style="background: #f3eef0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #6c0042; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Prochaine étape</p>
            <p style="color: #554249; font-size: 13px; margin: 0;">
              Notre équipe analysera votre profil sous 48 à 72 heures ouvrées. Si votre candidature est retenue, nous vous contacterons pour un entretien.
            </p>
          </div>
          <p style="color: #877179; font-size: 13px; margin: 0;">
            Cordialement,<br/>
            <strong style="color: #6c0042;">L'Équipe RH</strong><br/>
            RM Consulting
          </p>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send confirmation email:', err);
  }
}

export async function sendNewApplicationAlert(adminEmail: string, app: SimpleJobApp): Promise<void> {
  console.log(`[Recruitment] Alert for admin: ${app.firstName} ${app.lastName}`);
  const transporter = createTransporter();
  if (!transporter) { return; }

  const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nouvelle candidature - ${esc(app.firstName)} ${esc(app.lastName)} (${esc(app.position)})`,
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <div style="background: #6c0042; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; font-weight: 700; margin: 0;">Nouvelle candidature reçue</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700; width: 120px;">Candidat</td><td style="padding: 8px 0;">${esc(app.firstName)} ${esc(app.lastName)}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Email</td><td style="padding: 8px 0;">${esc(app.email)}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Téléphone</td><td style="padding: 8px 0;">${esc(app.phone)}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Poste</td><td style="padding: 8px 0;">${esc(app.position)}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="${esc(adminUrl)}" style="display: inline-block; background: #6c0042; color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700;">Voir dans le tableau de bord</a>
          </div>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send admin alert:', err);
  }
}

export interface InterviewInvitationData {
  firstName: string;
  lastName: string;
  position: string;
  date: string;
  time: string;
  type: 'presentiel' | 'en_ligne';
  location?: string;
  link?: string;
  notes?: string;
}

/** Convocation d'entretien envoyée au candidat. */
export async function sendInterviewInvitation(to: string, data: InterviewInvitationData): Promise<void> {
  console.log(`[Recruitment] Interview invitation for ${to}`);
  const transporter = createTransporter();
  if (!transporter) { return; }

  const typeLabel = data.type === 'presentiel' ? 'Présentiel' : 'En ligne';
  const formattedDate = new Date(`${data.date}T00:00:00`).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const rows = `
    <tr><td style="padding: 10px 0; color: #735b24; font-weight: 700; width: 140px;">Date</td><td style="padding: 10px 0; font-weight: 600;">${esc(formattedDate)}</td></tr>
    <tr><td style="padding: 10px 0; color: #735b24; font-weight: 700;">Heure</td><td style="padding: 10px 0; font-weight: 600;">${esc(formatTimeAmPm(data.time))}</td></tr>
    <tr><td style="padding: 10px 0; color: #735b24; font-weight: 700;">Type</td><td style="padding: 10px 0; font-weight: 600;">${esc(typeLabel)}</td></tr>
    ${
      data.type === 'presentiel'
        ? `<tr><td style="padding: 10px 0; color: #735b24; font-weight: 700;">Lieu</td><td style="padding: 10px 0; font-weight: 600;">${esc(data.location || 'Non spécifié')}</td></tr>`
        : `<tr><td style="padding: 10px 0; color: #735b24; font-weight: 700;">Lien de la réunion</td><td style="padding: 10px 0;"><a href="${esc(data.link || '')}" style="color: #6c0042; font-weight: 600;">${esc(data.link || 'Non spécifié')}</a></td></tr>`
    }
    ${data.notes ? `<tr><td style="padding: 10px 0; color: #735b24; font-weight: 700; vertical-align: top;">Notes</td><td style="padding: 10px 0;">${esc(data.notes)}</td></tr>` : ''}
  `;

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to,
      subject: `Convocation à un entretien - ${esc(data.position)} - RM Consulting`,
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <div style="background: #6c0042; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; font-weight: 700; margin: 0;">Convocation à un entretien</p>
          </div>
          <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour <strong>${esc(data.firstName)} ${esc(data.lastName)}</strong>,</p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Suite à l'étude de votre candidature pour le poste de <strong>${esc(data.position)}</strong>, nous avons le plaisir de vous convier à un entretien.
          </p>
          <div style="background: #f3eef0; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
            <p style="color: #6c0042; font-size: 12px; font-weight: 700; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Détails de l'entretien</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #1a1c1c;">
              ${rows}
            </table>
          </div>
          <p style="color: #877179; font-size: 13px; margin: 0 0 16px;">
            Merci de confirmer votre présence en répondant à cet email. Nous nous réjouissons de faire votre connaissance !
          </p>
          <p style="color: #877179; font-size: 13px; margin: 0;">
            Cordialement,<br/>
            <strong style="color: #6c0042;">L'Équipe RH</strong><br/>
            RM Consulting
          </p>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send interview invitation:', err);
  }
}

interface ApplicationOutcomeData {
  firstName: string;
  lastName: string;
  position: string;
  startDate?: string;
  startTime?: string;
}

/** Email envoyé au candidat lorsque sa candidature est acceptée. */
export async function sendApplicationAccepted(to: string, data: ApplicationOutcomeData): Promise<void> {
  console.log(`[Recruitment] Acceptance email for ${to}`);
  const transporter = createTransporter();
  if (!transporter) { return; }

  const hasStart = Boolean(data.startDate && data.startTime);
  const formattedStartDate = data.startDate
    ? new Date(`${data.startDate}T00:00:00`).toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '';

  const startRows = hasStart
    ? `
      <div style="background: #1e7a3c; border-radius: 8px; padding: 16px 20px; margin: 16px 0;">
        <p style="color: #ffffff; font-size: 12px; font-weight: 700; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px;">Date de prise de poste</p>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #ffffff;">
          <tr><td style="padding: 8px 0; font-weight: 700; width: 140px;">Date</td><td style="padding: 8px 0; font-weight: 600;">${esc(formattedStartDate)}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: 700;">Heure d'arrivée</td><td style="padding: 8px 0; font-weight: 600;">${esc(formatTimeAmPm(data.startTime || ''))}</td></tr>
        </table>
      </div>`
    : '';

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to,
      subject: `Félicitations ! Votre candidature a été acceptée - ${esc(data.position)} - RM Consulting`,
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <div style="background: #1e7a3c; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; font-weight: 700; margin: 0;">Candidature acceptée</p>
          </div>
          <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour <strong>${esc(data.firstName)} ${esc(data.lastName)}</strong>,</p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Félicitations ! Suite à l'étude de votre candidature pour le poste de <strong>${esc(data.position)}</strong>, nous avons le plaisir de vous annoncer que votre profil a été <strong>retenu</strong>. Vous intégrerez l'équipe RM Consulting !
          </p>
          ${startRows}
          <div style="background: #f3eef0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #6c0042; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Prochaines étapes</p>
            <p style="color: #554249; font-size: 13px; margin: 0;">
              ${hasStart
                ? `Nous vous attendons le <strong>${esc(formattedStartDate)}</strong> à <strong>${esc(formatTimeAmPm(data.startTime || ''))}</strong> pour votre première journée de travail. Veuillez vous présenter avec les documents administratifs requis (pièce d'identité, diplômes, relevé d'identité bancaire).`
                : 'Notre équipe RH vous contactera très prochainement pour les formalités d\'intégration (documents administratifs, date de prise de poste, etc.). N\'hésitez pas à nous poser vos questions par retour d\'email.'}
            </p>
          </div>
          <p style="color: #877179; font-size: 13px; margin: 0;">
            Nous nous réjouissons de vous accueillir au sein de RM Consulting !<br/>
            Cordialement,<br/>
            <strong style="color: #6c0042;">L'Équipe RH</strong><br/>
            RM Consulting
          </p>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send acceptance email:', err);
  }
}

/** Email envoyé au candidat lorsque sa candidature est refusée. */
export async function sendApplicationRejected(to: string, data: ApplicationOutcomeData): Promise<void> {
  console.log(`[Recruitment] Rejection email for ${to}`);
  const transporter = createTransporter();
  if (!transporter) { return; }

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to,
      subject: `Mise à jour de votre candidature - ${esc(data.position)} - RM Consulting`,
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <div style="background: #8f1d1d; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; font-weight: 700; margin: 0;">Candidature non retenue</p>
          </div>
          <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour <strong>${esc(data.firstName)} ${esc(data.lastName)}</strong>,</p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Nous vous remercions pour l'intérêt que vous avez porté à RM Consulting et pour le temps consacré à votre candidature au poste de <strong>${esc(data.position)}</strong>.
          </p>
          <p style="color: #554249; font-size: 14px; margin: 0 0 16px;">
            Après un examen attentif de votre profil, nous avons le regret de vous informer que nous ne pouvons pas donner suite à votre candidature à ce poste.
          </p>
          <div style="background: #f3eef0; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="color: #6c0042; font-size: 12px; font-weight: 700; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">Un conseil</p>
            <p style="color: #554249; font-size: 13px; margin: 0;">
              Cette décision ne remet pas en cause la qualité de votre profil. Nous vous encourageons vivement à postuler à nouveau pour nos prochaines offres, et vous souhaitons une excellente continuation.
            </p>
          </div>
          <p style="color: #877179; font-size: 13px; margin: 0;">
            Cordialement,<br/>
            <strong style="color: #6c0042;">L'Équipe RH</strong><br/>
            RM Consulting
          </p>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send rejection email:', err);
  }
}
