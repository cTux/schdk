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
import {
  clearLegacyGoogleDriveToken,
  clearStoredGoogleDriveToken,
  loadStoredGoogleDriveToken,
  storeGoogleDriveToken,
} from './google-drive-token-storage';
const TOKEN_REFRESH_WINDOW = 20 * 60_000;
const TOKEN_REFRESH_RETRY_INTERVAL = 5 * 60_000;

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
    clearLegacyGoogleDriveToken();
    const token = loadStoredGoogleDriveToken(clientId);
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
    clearStoredGoogleDriveToken();
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
    storeGoogleDriveToken({
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

  renewToken() {
    this.lastTokenRefreshAttempt = Date.now();
    return this.requestToken('', this.account?.emailAddress);
  }

  async generateAiQuestion(request: GameQuestionGenerationRequest) {
    const apiKey = await this.client.loadAiApiKey();
    if (!apiKey) throw new Error('AI API key is not configured');
    return generateGameQuestion({ ...request, apiKey });
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

  createAIQuestion = this.client.createAIQuestion.bind(this.client);
  createAIQuestionsPackage = this.client.createAIQuestionsPackage.bind(
    this.client,
  );
  updateAIQuestionsPackage = this.client.updateAIQuestionsPackage.bind(
    this.client,
  );
  deleteAIQuestionsPackage = this.client.deleteAIQuestionsPackage.bind(
    this.client,
  );
  listAIQuestionsPackages = this.client.listAIQuestionsPackages.bind(
    this.client,
  );
  loadAIQuestionsPackage = this.client.loadAIQuestionsPackage.bind(this.client);
  updateAIQuestion = this.client.updateAIQuestion.bind(this.client);
  deleteAIQuestion = this.client.deleteAIQuestion.bind(this.client);
  listAIQuestions = this.client.listAIQuestions.bind(this.client);
  loadAIQuestion = this.client.loadAIQuestion.bind(this.client);
  createGlobalAIQuestion = this.client.createGlobalAIQuestion.bind(this.client);
  updateGlobalAIQuestion = this.client.updateGlobalAIQuestion.bind(this.client);
  deleteGlobalAIQuestion = this.client.deleteGlobalAIQuestion.bind(this.client);
  listGlobalAIQuestions = this.client.listGlobalAIQuestions.bind(this.client);
  loadGlobalAIQuestion = this.client.loadGlobalAIQuestion.bind(this.client);
}
import {
  generateGameQuestion,
  type GameQuestionGenerationRequest,
} from '@schdk/ai';
