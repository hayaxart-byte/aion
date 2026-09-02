import type { User, UserRole } from '@aion/domain';
import { ROLE_LABELS_SHORT, extractProfileName } from '@aion/domain';

export function detectRoles(profile: any): UserRole[] {
  const resourceType = profile?.resourceType;
  const meta = profile?.meta?.tags ?? [];
  const tagRoles = meta
    .filter((t: any) => t.system === 'http://aion.app/roles')
    .map((t: any) => t.code as UserRole);

  if (tagRoles.length > 0) return tagRoles;

  const roleMap: Record<string, UserRole> = {
    Practitioner: 'doctor',
    Patient: 'patient',
    RelatedPerson: 'patient',
  };
  const deduced = roleMap[resourceType];
  if (deduced) return [deduced];

  const qual = profile?.qualification?.[0]?.code?.coding?.[0]?.code;
  if (qual === 'MD' || qual === 'DO') return ['doctor'];
  if (qual === 'RN') return ['nurse'];

  return ['patient'];
}

export function buildUser(profile: any, email?: string): User {
  return {
    id: profile?.id ?? '',
    email: email ?? profile?.email ?? '',
    name: extractProfileName(profile),
    roles: detectRoles(profile),
    profileReference: profile?.resourceType ? `${profile.resourceType}/${profile.id}` : undefined,
    profile,
  };
}

export function getPrimaryRoleLabel(roles: UserRole[]): string {
  if (roles.length === 0) return 'Usuario';
  if (roles.includes('admin')) return ROLE_LABELS_SHORT.admin;
  if (roles.includes('doctor')) return ROLE_LABELS_SHORT.doctor;
  if (roles.includes('receptionist')) return ROLE_LABELS_SHORT.receptionist;
  if (roles.includes('nurse')) return ROLE_LABELS_SHORT.nurse;
  return ROLE_LABELS_SHORT.patient;
}