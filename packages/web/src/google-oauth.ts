import { type TokenResponse } from './token-response';

interface TokenClient {
  requestAccessToken(config?: { prompt?: string }): void;
}

export interface GoogleOauth {
  initTokenClient(config: {
    client_id: string;
    scope: string;
    callback(response: TokenResponse): void;
    error_callback(error: { type?: string }): void;
    login_hint?: string;
  }): TokenClient;
  revoke(token: string, callback: () => void): void;
}
