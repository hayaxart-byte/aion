import type { MedplumClient } from '@aion/vendor-medplum';

export interface PractitionerInfo {
  id: string;
  name: string;
  qualification: string;
}

export async function getCurrentPractitioner(
  medplum: MedplumClient,
): Promise<PractitionerInfo | null> {
  const profile = medplum.getProfile();
  if (!profile) return null;

  if (profile.resourceType === 'Practitioner') {
    const n = profile.name?.[0];
    const name = n
      ? `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim()
      : 'Profesional';
    const qual =
      profile.qualification?.[0]?.code?.coding?.[0]?.display ?? '';
    return { id: profile.id, name, qualification: qual };
  }

  if (profile.resourceType === 'Patient') {
    const n = profile.name?.[0];
    const name = n
      ? `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim()
      : 'Paciente';
    return { id: profile.id, name, qualification: '' };
  }

  return { id: profile.id, name: 'Usuario', qualification: '' };
}

export async function getPractitionerByProfile(
  medplum: MedplumClient,
  profile: any,
): Promise<PractitionerInfo | null> {
  if (!profile) return null;
  const n = profile.name?.[0];
  const name = n
    ? `${n.given?.[0] ?? ''} ${n.family ?? ''}`.trim()
    : '—';
  const qual =
    profile.qualification?.[0]?.code?.coding?.[0]?.display ?? '';
  return { id: profile.id, name, qualification: qual };
}