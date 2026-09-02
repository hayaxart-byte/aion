import { NextResponse } from 'next/server';
import { verifyEmailCode } from '@/lib/verification';

export async function POST(req: Request) {
  try {
    const { email, code } = await req.json();

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
    }

    if (!code || typeof code !== 'string' || code.length !== 6) {
      return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
    }

    const result = await verifyEmailCode(email, code);

    switch (result) {
      case 'ok':
        return NextResponse.json({ success: true });
      case 'expired':
        return NextResponse.json({ error: 'El código ha expirado. Solicita uno nuevo.' }, { status: 410 });
      case 'used':
        return NextResponse.json({ error: 'Este código ya fue utilizado.' }, { status: 410 });
      case 'blocked':
        return NextResponse.json({ error: 'Demasiados intentos. Solicita un nuevo código.' }, { status: 429 });
      case 'invalid':
      default:
        return NextResponse.json({ error: 'Código inválido' }, { status: 401 });
    }
  } catch (err) {
    console.error('[VerifyEmail]', err);
    return NextResponse.json({ error: 'Error al verificar código' }, { status: 500 });
  }
}
