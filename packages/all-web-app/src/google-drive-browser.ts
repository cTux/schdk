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

interface StoredToken {
  accessToken: string;
  clientId: string;
  expiresAt: number;
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
const TOKEN_KEY = 'schdk:google-drive-token';

function clearStoredToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    // The in-memory token still works when session storage is unavailable.
  }
}

function loadStoredToken(clientId: string): StoredToken | null {
  try {
    const value = JSON.parse(
      sessionStorage.getItem(TOKEN_KEY) ?? 'null',
    ) as Partial<StoredToken> | null;
    if (
      value &&
      typeof value.accessToken === 'string' &&
      value.accessToken.length > 0 &&
      value.accessToken.length <= 4096 &&
      value.clientId === clientId &&
      typeof value.expiresAt === 'number' &&
      Number.isFinite(value.expiresAt) &&
      value.expiresAt > Date.now()
    ) {
      return value as StoredToken;
    }
  } catch {
    // Invalid or unavailable storage behaves like a signed-out session.
  }
  clearStoredToken();
  return null;
}

function storeToken(token: StoredToken) {
  try {
    sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token));
  } catch {
    // The access token remains usable in memory for the current page.
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
    if (!this.hasValidToken()) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    return this.accessToken;
  });

  constructor(private readonly clientId: string) {
    const token = loadStoredToken(clientId);
    if (!token) return;
    this.accessToken = token.accessToken;
    this.expiresAt = token.expiresAt;
  }

  private clearToken() {
    this.accessToken = '';
    this.expiresAt = 0;
    this.account = undefined;
    clearStoredToken();
  }

  private hasValidToken() {
    if (this.accessToken && Date.now() < this.expiresAt) return true;
    this.clearToken();
    return false;
  }

  private requestToken() {
    this.tokenRequest ??= this.fetchToken().finally(() => {
      this.tokenRequest = undefined;
    });
    return this.tokenRequest;
  }

  private async fetchToken() {
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
    storeToken({
      accessToken: this.accessToken,
      clientId: this.clientId,
      expiresAt: this.expiresAt,
    });
  }

  async status() {
    if (!this.hasValidToken()) {
      return { state: 'disconnected' } as const;
    }
    this.account ??= await this.client.getAccount();
    return { state: 'connected', account: this.account } as const;
  }

  async connect() {
    await this.requestToken();
    this.account = await this.client.getAccount();
    return this.account;
  }

  async disconnect() {
    const token = this.accessToken;
    this.clearToken();
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

  createGamePackage(
    value: Parameters<GoogleDriveClient['createGamePackage']>[0],
  ) {
    return this.client.createGamePackage(value);
  }

  updateGamePackage(
    fileId: string,
    value: Parameters<GoogleDriveClient['updateGamePackage']>[1],
  ) {
    return this.client.updateGamePackage(fileId, value);
  }

  listGamePackages() {
    return this.client.listGamePackages();
  }

  loadGamePackage(fileId: string) {
    return this.client.loadGamePackage(fileId);
  }
}
