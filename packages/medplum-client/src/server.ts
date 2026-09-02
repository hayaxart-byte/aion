import { cache } from 'react';
import { MEDPLUM_BASE_URL } from './config';

const IS_DEV_SERVER = process.env.NODE_ENV === 'development';

interface FhirResponse {
  entry?: Array<{ resource: any }>;
  total?: number;
  link?: Array<{ relation: string; url: string }>;
}

export class ServerFhirClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(accessToken: string) {
    this.baseUrl = MEDPLUM_BASE_URL.replace(/\/+$/, '');
    this.accessToken = accessToken;
    if (IS_DEV_SERVER) {
      console.log('[ServerFhirClient] Created with baseUrl:', this.baseUrl, 'token length:', accessToken?.length ?? 0);
    }
  }

  async search(resourceType: string, params: Record<string, string>): Promise<FhirResponse> {
    const qs = new URLSearchParams(params).toString();
    const url = `${this.baseUrl}/fhir/R4/${resourceType}?${qs}`;
    if (IS_DEV_SERVER) {
      console.log('[ServerFhirClient] GET', url);
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (IS_DEV_SERVER) {
        console.error('[ServerFhirClient] ERROR', resourceType, res.status, body.slice(0, 200));
      }
      throw new Error(`FHIR search ${resourceType} failed: ${res.status} ${res.statusText}`);
    }
    if (IS_DEV_SERVER) {
      console.log('[ServerFhirClient] OK', resourceType, 'status:', res.status);
    }
    return res.json();
  }

  async read(resourceType: string, id: string): Promise<any> {
    const url = `${this.baseUrl}/fhir/R4/${resourceType}/${id}`;
    if (IS_DEV_SERVER) {
      console.log('[ServerFhirClient] GET', url);
    }
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: 'application/fhir+json',
      },
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      if (IS_DEV_SERVER) {
        console.error('[ServerFhirClient] ERROR', resourceType, id, res.status, body.slice(0, 200));
      }
      throw new Error(`FHIR read ${resourceType}/${id} failed: ${res.status}`);
    }
    return res.json();
  }
}

export const createServerClient = cache((accessToken: string): ServerFhirClient => {
  if (IS_DEV_SERVER) {
    console.log('[ServerFhirClient] Creating cached client for token:', accessToken?.slice(0, 10) + '...');
  }
  return new ServerFhirClient(accessToken);
});
