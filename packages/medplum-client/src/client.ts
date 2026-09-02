'use client';

import { MedplumClient } from '@aion/vendor-medplum';
import { getAccessToken } from './session';

export function createClient(baseUrl: string, storagePrefix: string): MedplumClient {
  return new MedplumClient({ baseUrl, storagePrefix });
}

export class AionClient {
  private client: MedplumClient;
  private storagePrefix: string;

  constructor(baseUrl: string, storagePrefix: string) {
    this.client = createClient(baseUrl, storagePrefix);
    this.storagePrefix = storagePrefix;
  }

  getMedplumClient(): MedplumClient {
    return this.client;
  }

  getStoragePrefix(): string {
    return this.storagePrefix;
  }

  async login(email: string, password: string): Promise<any> {
    const loginResponse = await this.client.startLogin({
      email,
      password,
      scope: 'openid offline_access',
    });
    if (loginResponse.code) {
      await this.client.processCode(loginResponse.code);
    }
    return this.client.getProfile();
  }

  async logout(): Promise<void> {
    await this.client.signOut();
  }

  getProfile(): any {
    return this.client.getProfile();
  }

  async getProfileAsync(): Promise<any> {
    return this.client.getProfileAsync();
  }

  getActiveLogin(): any {
    return this.client.getActiveLogin();
  }

  getAccessToken(): string | null {
    return getAccessToken(this.client, this.storagePrefix);
  }

  hasSession(): boolean {
    return !!this.client.getActiveLogin() && !!this.client.getAccessToken();
  }
}
