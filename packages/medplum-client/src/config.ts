function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103/';
  }
  return process.env.MEDPLUM_BASE_URL || process.env.NEXT_PUBLIC_MEDPLUM_BASE_URL || 'http://localhost:8103/';
}

export const MEDPLUM_BASE_URL = getBaseUrl();
