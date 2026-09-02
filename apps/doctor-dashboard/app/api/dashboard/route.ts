import { NextResponse } from 'next/server';
import { MedplumClient } from '@aion/vendor-medplum';
import { getDashboardData } from '@/lib/server/medplum/dashboard.service';

function getBaseUrl(): string {
  return process.env.MEDPLUM_BASE_URL || process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103/';
}

async function validateSession(accessToken: string): Promise<boolean> {
  if (!accessToken) return false;
  try {
    const client = new MedplumClient({
      baseUrl: getBaseUrl(),
      accessToken,
    });
    const profile = await client.getProfileAsync();
    return !!profile;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  try {
    const { accessToken } = await request.json();

    if (!accessToken) {
      return NextResponse.json({ error: 'accessToken requerido' }, { status: 401 });
    }

    const isValid = await validateSession(accessToken);
    if (!isValid) {
      return NextResponse.json({ error: 'Sesión inválida o expirada' }, { status: 401 });
    }

    const data = await getDashboardData(accessToken);
    return NextResponse.json(data);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error interno';
    console.error('Dashboard API error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}