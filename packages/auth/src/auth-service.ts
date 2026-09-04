import type { MedplumClient } from '@aion/vendor-medplum';
import type { User, UserRole } from '@aion/domain';
import { buildUser } from './utils';

export async function login(
  client: MedplumClient,
  email: string,
  password: string,
): Promise<User> {
  const loginResponse = await client.startLogin({
    email,
    password,
    clientId: '8fea6f91-d2dc-4892-975c-948bb4d47c6c',
    projectId: 'dd3366a9-4f1c-4c31-a6e7-e34eef272f40',
    scope: 'openid offline_access',
  });
  if (loginResponse.code) {
    await client.processCode(loginResponse.code);
  }
  const profile = client.getProfile();
  if (!profile) {
    throw new Error('No se pudo obtener el perfil del usuario');
  }
  return buildUser(profile, email);
}

export async function logout(client: MedplumClient): Promise<void> {
  await client.signOut();
}

export function getCurrentUser(client: MedplumClient): User | null {
  const profile = client.getProfile();
  if (!profile) return null;
  return buildUser(profile);
}

export async function getCurrentUserAsync(client: MedplumClient): Promise<User | null> {
  try {
    const profile = await client.getProfileAsync();
    if (!profile) return null;
    return buildUser(profile);
  } catch {
    return null;
  }
}

export function hasRole(client: MedplumClient, ...roles: UserRole[]): boolean {
  const user = getCurrentUser(client);
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

export function getMedplumBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103/';
  }
  return process.env.MEDPLUM_BASE_URL || process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103/';
}