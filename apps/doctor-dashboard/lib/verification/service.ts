import { createEmailProvider } from '../email';
import { generateCode, storeCode, verifyCode } from './store';

const provider = createEmailProvider();

function buildEmailHtml(code: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="font-size: 20px; font-weight: 700; color: #1a1a2e; margin: 0;">Aion</h1>
        <p style="color: #6b7280; font-size: 14px; margin: 4px 0 0;">Verificación de correo electrónico</p>
      </div>
      <div style="background: #f9fafb; border-radius: 16px; padding: 32px 24px; text-align: center;">
        <p style="color: #374151; font-size: 14px; margin: 0 0 16px;">Usa el siguiente código para verificar tu correo:</p>
        <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #2563eb; background: #fff; border-radius: 12px; padding: 16px 24px; display: inline-block; border: 1px solid #e5e7eb;">
          ${code}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">Este código expira en 10 minutos.</p>
      </div>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 24px;">
        Si no solicitaste este código, puedes ignorar este mensaje.
      </p>
    </div>
  `.trim();
}

export async function sendVerificationCode(email: string): Promise<'sent' | 'rate-limited'> {
  const code = generateCode();
  const stored = storeCode(email, code);
  if (!stored) return 'rate-limited';

  await provider.send({
    to: email,
    subject: 'Tu código de verificación — Aion',
    html: buildEmailHtml(code),
  });

  return 'sent';
}

export async function verifyEmailCode(
  email: string,
  code: string,
): Promise<'ok' | 'expired' | 'invalid' | 'used' | 'blocked'> {
  return verifyCode(email, code);
}
