import { type GoogleOauth } from './google-oauth';
import { type TokenResponse } from '../../types/google-drive/token-response';

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

export { type TokenResponse, type GoogleOauth, loadGoogleOauth };
