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
