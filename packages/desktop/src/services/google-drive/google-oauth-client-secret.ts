import { app } from 'electron';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export function loadGoogleDesktopClientSecret() {
  const configured = process.env.GOOGLE_DESKTOP_CLIENT_SECRET?.trim();
  if (configured) return configured;
  if (!app.isPackaged) return '';
  try {
    const credentials = JSON.parse(
      readFileSync(
        join(process.resourcesPath, 'google-oauth-client.json'),
        'utf8',
      ),
    ) as { installed?: { client_secret?: unknown } };
    return typeof credentials.installed?.client_secret === 'string'
      ? credentials.installed.client_secret.trim()
      : '';
  } catch {
    return '';
  }
}
