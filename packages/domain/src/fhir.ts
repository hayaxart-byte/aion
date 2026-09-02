import { ROLE_LABELS } from './constants';

export function extractProfileName(profile: any, fallback = 'Usuario'): string {
  if (!profile) return fallback;
  const n = profile.name?.[0];
  if (n) {
    const given = n.given?.[0] ?? '';
    const family = n.family ?? '';
    const full = `${given} ${family}`.trim();
    if (full) return full;
  }
  if (profile.firstName || profile.lastName) {
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim() || fallback;
  }
  return fallback;
}

export function extractProfileEmail(profile: any): string | undefined {
  if (profile.email) return profile.email;
  const telecom = profile.telecom?.find((t: any) => t.system === 'email');
  return telecom?.value ?? undefined;
}

export function extractProfileRole(profile: any): string {
  const rt = profile.resourceType;
  const qual = profile.qualification?.[0]?.code?.coding?.[0]?.display;
  return qual ?? ROLE_LABELS[rt] ?? rt ?? 'Profesional de la salud';
}

export function extractName(resource: any): string {
  const n = resource?.name?.[0];
  if (!n) return '—';
  return `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim() || '—';
}

export function patientIdFromRef(ref: string): string {
  return ref?.startsWith('Patient/') ? ref.replace('Patient/', '') : '';
}

export function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

export function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}

export function formatDateShort(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es', {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '—';
  }
}
