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
  requestAccessToken(config?: { prompt?: 'none' }): void;
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
const CONNECTED_KEY = 'schdk:google-drive-connected';

function connectionWasRemembered() {
  try {
    return localStorage.getItem(CONNECTED_KEY) === 'true';
  } catch {
    return false;
  }
}

function rememberConnection(connected: boolean) {
  try {
    if (connected) localStorage.setItem(CONNECTED_KEY, 'true');
    else localStorage.removeItem(CONNECTED_KEY);
  } catch {
    // Connection still works when browser storage is unavailable.
  }
}

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
  private tokenRequest?: Promise<void>;
  private readonly client = new GoogleDriveClient(async () => {
    if (
      (!this.accessToken || Date.now() >= this.expiresAt) &&
      connectionWasRemembered()
    ) {
      await this.requestToken('none');
    }
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    return this.accessToken;
  });

  constructor(private readonly clientId: string) {}

  private requestToken(prompt?: 'none') {
    this.tokenRequest ??= this.fetchToken(prompt).finally(() => {
      this.tokenRequest = undefined;
    });
    return this.tokenRequest;
  }

  private async fetchToken(prompt?: 'none') {
    const oauth = await loadGoogleOauth();
    const response = await new Promise<TokenResponse>((resolve, reject) => {
      const client = oauth.initTokenClient({
        client_id: this.clientId,
        scope: GOOGLE_DRIVE_SCOPES.join(' '),
        callback: resolve,
        error_callback: (error) =>
          reject(new Error(error.type ?? 'Google authorization failed')),
      });
      client.requestAccessToken(prompt ? { prompt } : undefined);
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
  }

  async status() {
    if (
      (!this.accessToken || Date.now() >= this.expiresAt) &&
      connectionWasRemembered()
    ) {
      try {
        await this.requestToken('none');
      } catch {
        return { state: 'disconnected' } as const;
      }
    }
    if (!this.accessToken || Date.now() >= this.expiresAt) {
      return { state: 'disconnected' } as const;
    }
    this.account ??= await this.client.getAccount();
    return { state: 'connected', account: this.account } as const;
  }

  async connect() {
    await this.requestToken();
    this.account = await this.client.getAccount();
    rememberConnection(true);
    return this.account;
  }

  async disconnect() {
    rememberConnection(false);
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
