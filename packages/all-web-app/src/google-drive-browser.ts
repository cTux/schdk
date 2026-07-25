import {
  GOOGLE_DRIVE_SCOPES,
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
  type DriveAccount,
  type DriveSettingsDocument,
} from '@schdk/google-drive';
import type { GoogleDriveBridge } from './google-drive-types';

interface TokenResponse {
  access_token?: string;
  error?: string;
  expires_in?: number;
  scope?: string;
}

interface TokenClient {
  requestAccessToken(): void;
}

interface GoogleOauth {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback(response: TokenResponse): void;
    error_callback(error: { type?: string }): void;
  }): TokenClient;
  revoke(token: string, callback: () => void): void;
}

let googleScript: Promise<GoogleOauth> | undefined;

function loadGoogleOauth(): Promise<GoogleOauth> {
  googleScript ??= new Promise((resolve, reject) => {
    const current = (
      window as unknown as {
        google?: { accounts?: { oauth2?: GoogleOauth } };
      }
    ).google?.accounts?.oauth2;
    if (current) {
      resolve(current);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = () => {
      const oauth = (
        window as unknown as {
          google?: { accounts?: { oauth2?: GoogleOauth } };
        }
      ).google?.accounts?.oauth2;
      if (oauth) resolve(oauth);
      else reject(new Error('Google Identity Services did not load'));
    };
    script.onerror = () =>
      reject(new Error('Google Identity Services did not load'));
    document.head.append(script);
  });
  return googleScript;
}

export class BrowserGoogleDriveBridge implements GoogleDriveBridge {
  private accessToken = '';
  private account?: DriveAccount;
  private expiresAt = 0;
  private readonly client = new GoogleDriveClient(async () => {
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    return this.accessToken;
  });

  constructor(private readonly clientId: string) {}

  async status() {
    return this.accessToken && Date.now() < this.expiresAt && this.account
      ? ({ state: 'connected', account: this.account } as const)
      : ({ state: 'disconnected' } as const);
  }

  async connect() {
    const oauth = await loadGoogleOauth();
    const response = await new Promise<TokenResponse>((resolve, reject) => {
      const client = oauth.initTokenClient({
        client_id: this.clientId,
        scope: GOOGLE_DRIVE_SCOPES.join(' '),
        callback: resolve,
        error_callback: (error) =>
          reject(new Error(error.type ?? 'Google authorization failed')),
      });
      client.requestAccessToken();
    });
    if (
      response.error ||
      !response.access_token ||
      !GOOGLE_DRIVE_SCOPES.every((scope) =>
        response.scope?.split(' ').includes(scope),
      )
    ) {
      throw new Error(response.error ?? 'Required Google Drive access denied');
    }
    this.accessToken = response.access_token;
    this.expiresAt = Date.now() + (response.expires_in ?? 3600) * 1000;
    this.account = await this.client.getAccount();
    return this.account;
  }

  async disconnect() {
    const token = this.accessToken;
    this.accessToken = '';
    this.expiresAt = 0;
    this.account = undefined;
    if (!token) return;
    const oauth = await loadGoogleOauth();
    await new Promise<void>((resolve) => oauth.revoke(token, resolve));
  }

  loadSettings() {
    return this.client.loadSettings();
  }

  saveSettings(settings: DriveSettingsDocument) {
    return this.client.saveSettings(settings);
  }
}
