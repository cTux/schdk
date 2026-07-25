import { isDriveFileId, type DriveSettingsDocument } from './settings.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const SETTINGS_NAME = 'settings-v1.json';

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
] as const;

export interface DriveAccount {
  displayName: string;
  emailAddress: string;
}

export class GoogleDriveAuthorizationError extends Error {}

interface SettingsFile {
  id: string;
}

export class GoogleDriveClient {
  constructor(private readonly getAccessToken: () => Promise<string>) {}

  async getAccount(): Promise<DriveAccount> {
    const response = await this.request(
      `${DRIVE_API}/about?fields=user(displayName,emailAddress)`,
    );
    const value = (await response.json()) as {
      user?: Partial<DriveAccount>;
    };
    if (
      typeof value.user?.displayName !== 'string' ||
      typeof value.user.emailAddress !== 'string'
    ) {
      throw new Error('Google Drive account metadata is unavailable');
    }
    return {
      displayName: value.user.displayName,
      emailAddress: value.user.emailAddress,
    };
  }

  async loadSettings(): Promise<unknown | null> {
    const file = await this.findSettingsFile();
    if (!file) return null;
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(file.id)}?alt=media`,
    );
    return response.json();
  }

  async saveSettings(settings: DriveSettingsDocument): Promise<void> {
    const file = await this.findSettingsFile();
    const metadata = file
      ? { name: SETTINGS_NAME }
      : { name: SETTINGS_NAME, parents: ['appDataFolder'] };
    const boundary = `schdk-${crypto.randomUUID()}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`,
      JSON.stringify(settings),
      `\r\n--${boundary}--`,
    ]);
    const target = file
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(file.id)}?uploadType=multipart`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart`;
    await this.request(target, {
      method: file ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
  }

  private async findSettingsFile(): Promise<SettingsFile | null> {
    const query = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name = '${SETTINGS_NAME}' and trashed = false`,
      fields: 'files(id)',
      pageSize: '1',
    });
    const response = await this.request(`${DRIVE_API}/files?${query}`);
    const value = (await response.json()) as { files?: SettingsFile[] };
    const file = value.files?.[0];
    return file && isDriveFileId(file.id) ? file : null;
  }

  private async request(input: string, init: RequestInit = {}) {
    const response = await fetch(input, {
      ...init,
      headers: {
        Authorization: `Bearer ${await this.getAccessToken()}`,
        ...init.headers,
      },
    });
    if (response.status === 401) {
      throw new GoogleDriveAuthorizationError('Google Drive access expired');
    }
    if (!response.ok) {
      throw new Error(`Google Drive request failed (${response.status})`);
    }
    return response;
  }
}
