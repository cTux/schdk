import type { OAuthTokens } from './o-auth-tokens.js';

export const googleDriveAuthState: {
  tokens?: OAuthTokens;
  storedRefreshTokenLoaded: boolean;
} = {
  storedRefreshTokenLoaded: false,
};
