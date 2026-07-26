import {
  GOOGLE_DRIVE_SCOPES,
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
  type DriveAccount,
  type DriveSettingsDocument,
} from '@schdk/google-drive';
import {
  loadGoogleOauth,
  type GoogleOauth,
  type TokenResponse,
} from './google-oauth-browser';
import type { GoogleDriveBridge } from './google-drive-types';

interface StoredToken {
  accessToken: string;
  clientId: string;
  expiresAt: number;
}

const TOKEN_KEY = 'schdk:google-drive-token';
const TOKEN_REFRESH_WINDOW = 20 * 60_000;
const TOKEN_REFRESH_RETRY_INTERVAL = 5 * 60_000;

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

export class BrowserGoogleDriveBridge implements GoogleDriveBridge {
  private accessToken = '';
  private account?: DriveAccount;
  private expiresAt = 0;
  private googleOauth?: GoogleOauth;
  private lastTokenRefreshAttempt = 0;
  private tokenRequest?: Promise<void>;
  private readonly client = new GoogleDriveClient(async () => {
    if (!this.hasValidToken()) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    return this.accessToken;
  });

  constructor(private readonly clientId: string) {
    const token = loadStoredToken(clientId);
    if (token) {
      this.accessToken = token.accessToken;
      this.expiresAt = token.expiresAt;
      void loadGoogleOauth()
        .then((oauth) => {
          this.googleOauth = oauth;
        })
        .catch(() => undefined);
    }
    document.addEventListener('click', this.refreshTokenOnActivity);
  }

  private readonly refreshTokenOnActivity = () => {
    const now = Date.now();
    if (
      !this.accessToken ||
      !this.account ||
      !this.googleOauth ||
      this.expiresAt - now > TOKEN_REFRESH_WINDOW ||
      now - this.lastTokenRefreshAttempt < TOKEN_REFRESH_RETRY_INTERVAL
    ) {
      return;
    }
    this.lastTokenRefreshAttempt = now;
    void this.requestToken('', this.account.emailAddress).catch(
      () => undefined,
    );
  };

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

  private requestToken(prompt?: string, loginHint?: string) {
    this.tokenRequest ??= this.fetchToken(prompt, loginHint).finally(() => {
      this.tokenRequest = undefined;
    });
    return this.tokenRequest;
  }

  private async fetchToken(prompt?: string, loginHint?: string) {
    const oauth = this.googleOauth ?? (await loadGoogleOauth());
    this.googleOauth = oauth;
    const response = await new Promise<TokenResponse>((resolve, reject) => {
      const client = oauth.initTokenClient({
        client_id: this.clientId,
        scope: GOOGLE_DRIVE_SCOPES.join(' '),
        callback: resolve,
        error_callback: (error) =>
          reject(new Error(error.type ?? 'Google authorization failed')),
        ...(loginHint ? { login_hint: loginHint } : {}),
      });
      client.requestAccessToken(prompt === undefined ? undefined : { prompt });
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
    try {
      this.account ??= await this.client.getAccount();
      return { state: 'connected', account: this.account } as const;
    } catch (error) {
      if (!(error instanceof GoogleDriveAuthorizationError)) throw error;
      this.clearToken();
      return { state: 'disconnected' } as const;
    }
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

  async hasAiApiKey() {
    return Boolean(await this.client.loadAiApiKey());
  }

  saveAiApiKey(apiKey: string | null) {
    return this.client.saveAiApiKey(apiKey);
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

  deleteGamePackage(fileId: string) {
    return this.client.deleteGamePackage(fileId);
  }

  listGamePackages() {
    return this.client.listGamePackages();
  }

  loadGamePackage(fileId: string) {
    return this.client.loadGamePackage(fileId);
  }
}
