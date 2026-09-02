import { MedplumClient } from '@aion/vendor-medplum';

export function getAccessToken(medplum: MedplumClient, storagePrefix = 'medplum:'): string | null {
  const token = medplum.getAccessToken();
  if (token) return token;
  try {
    const raw = localStorage.getItem(`${storagePrefix}activeLogin`);
    if (raw) {
      const parsed = JSON.parse(raw) as { accessToken?: string };
      return parsed.accessToken ?? null;
    }
  } catch {
    // localStorage not available or parse error
  }
  return null;
}
