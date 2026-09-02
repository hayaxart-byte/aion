import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('[Onboarding] Save request:', { ...body, plan: body.plan });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[Onboarding] Save error:', err);
    return NextResponse.json({ error: 'Error al guardar onboarding' }, { status: 500 });
  }
}
