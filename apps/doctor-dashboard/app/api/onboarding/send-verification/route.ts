import { NextResponse } from 'next/server';
import { sendVerificationCode } from '@/lib/verification';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    const result = await sendVerificationCode(email);

    if (result === 'rate-limited') {
      return NextResponse.json(
        { error: 'Espera un minuto antes de solicitar otro código' },
        { status: 429 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[SendVerification]', err);
    return NextResponse.json({ error: 'Error al enviar código' }, { status: 500 });
  }
}
