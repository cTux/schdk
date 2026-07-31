import { GoogleDriveAuthorizationError } from '@schdk/google-drive';
import { clientSecret } from './client-secret.js';
import { TOKEN_ENDPOINT } from './token-endpoint.js';

class OAuthTokenError extends GoogleDriveAuthorizationError {
  constructor(
    readonly code: string,
    description?: string,
  ) {
    super([code, description].filter(Boolean).join(': '));
  }
}

async function requestTokens(parameters: URLSearchParams) {
  parameters.set('client_secret', clientSecret);
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: parameters,
  });
  const value = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
    expires_in?: number;
    refresh_token?: string;
    scope?: string;
  };
  if (!response.ok || !value.access_token) {
    throw new OAuthTokenError(
      value.error ?? 'authorization_failed',
      value.error_description,
    );
  }
  return value;
}

export { OAuthTokenError, requestTokens };
