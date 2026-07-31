import nodemailer from 'nodemailer';

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
          <p style="color: #1a1c1c; font-size: 15px; margin: 0 0 16px;">Bonjour <strong>${firstName}</strong>,</p>
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

  try {
    await transporter.sendMail({
      from: `"RM Consulting Recrutement" <${process.env.SMTP_USER}>`,
      to: adminEmail,
      subject: `Nouvelle candidature - ${app.firstName} ${app.lastName} (${app.position})`,
      html: `${tplHeader}
        <div style="background: white; border-radius: 12px; padding: 24px; border: 1px solid #dac0c8;">
          <div style="background: #6c0042; color: white; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; text-align: center;">
            <p style="font-size: 14px; font-weight: 700; margin: 0;">Nouvelle candidature reçue</p>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700; width: 120px;">Candidat</td><td style="padding: 8px 0;">${app.firstName} ${app.lastName}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Email</td><td style="padding: 8px 0;">${app.email}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Téléphone</td><td style="padding: 8px 0;">${app.phone}</td></tr>
            <tr><td style="padding: 8px 0; color: #735b24; font-weight: 700;">Poste</td><td style="padding: 8px 0;">${app.position}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="http://localhost:3001" style="display: inline-block; background: #6c0042; color: white; text-decoration: none; padding: 10px 24px; border-radius: 8px; font-size: 13px; font-weight: 700;">Voir dans le tableau de bord</a>
          </div>
        </div>
      ${tplFooter}`,
    });
  } catch (err) {
    console.error('[Recruitment] Failed to send admin alert:', err);
  }
}
