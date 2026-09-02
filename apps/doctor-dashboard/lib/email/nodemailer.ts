import nodemailer from 'nodemailer';
import type { EmailProvider, SendEmailParams } from './types';

function getConfig() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';
  const from = process.env.SMTP_FROM || user;
  return { host, port, user, pass, from };
}

let _transport: nodemailer.Transporter | null = null;

function getTransport(): nodemailer.Transporter {
  if (!_transport) {
    const { host, port, user, pass } = getConfig();
    _transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });
  }
  return _transport;
}

export function resetTransportForTest() {
  _transport = null;
}

export class NodemailerEmailProvider implements EmailProvider {
  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    const { from } = getConfig();
    await getTransport().sendMail({ from, to, subject, html });
  }
}

export function createEmailProvider(): EmailProvider {
  const { user, pass } = getConfig();
  if (!user || !pass) {
    console.warn('[Email] SMTP not configured — using debug mode (prints to console)');
    return new DebugEmailProvider();
  }
  return new NodemailerEmailProvider();
}

class DebugEmailProvider implements EmailProvider {
  async send({ to, subject, html }: SendEmailParams): Promise<void> {
    console.log('---[Email Debug]---');
    console.log('To:', to);
    console.log('Subject:', subject);
    console.log('Body:', html.replace(/<[^>]*>/g, ' ').trim());
    console.log('-------------------');
  }
}
