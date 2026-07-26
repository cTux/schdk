export interface TokenResponse {
  access_token?: string;
  error?: string;
  expires_in?: number;
  scope?: string;
}

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

let googleScript: Promise<GoogleOauth> | undefined;

export function loadGoogleOauth(): Promise<GoogleOauth> {
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
