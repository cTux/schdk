import { parseDriveAccount, type DriveAccount } from './account.js';
import { GoogleDriveAppData } from './app-data.js';
import { isDriveFileId, type DriveSettingsDocument } from './settings.js';
import {
  DRIVE_APP_KIND_KEY,
  DRIVE_FOLDER_KIND,
  DRIVE_FOLDER_MIME_TYPE,
  DRIVE_PACKAGE_KIND,
  DRIVE_PACKAGE_MIME_TYPE,
  isDriveGamePackageName,
  parseDriveGamePackageFile,
  type DriveGamePackage,
  type DriveGamePackageFile,
  type DriveGamePackageWrite,
  type DrivePackageStorage,
} from './game-packages.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const AI_CREDENTIALS_NAME = 'ai-credentials-v1.json';
const MAX_AI_API_KEY_LENGTH = 16_384;
const SETTINGS_NAME = 'settings-v1.json';
const PACKAGE_FOLDER_NAME = 'SCHDK';

export const GOOGLE_DRIVE_SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.appdata',
] as const;

export type { DriveAccount } from './account.js';

export class GoogleDriveAuthorizationError extends Error {}

interface DriveFile {
  id: string;
}

export class GoogleDriveClient implements DrivePackageStorage {
  private readonly appData = new GoogleDriveAppData((input, init) =>
    this.request(input, init),
  );
  constructor(private readonly getAccessToken: () => Promise<string>) {}

  async getAccount(): Promise<DriveAccount> {
    const response = await this.request(
      `${DRIVE_API}/about?fields=user(displayName,emailAddress,photoLink)`,
    );
    const account = parseDriveAccount(await response.json());
    if (!account) {
      throw new Error('Google Drive account metadata is unavailable');
    }
    return account;
  }

  async loadSettings(): Promise<unknown | null> {
    return this.appData.load(SETTINGS_NAME);
  }

  async saveSettings(settings: DriveSettingsDocument): Promise<void> {
    await this.appData.save(SETTINGS_NAME, settings);
  }

  async loadAiApiKey(): Promise<string | null> {
    const value = await this.appData.load(AI_CREDENTIALS_NAME);
    if (value === null) return null;
    if (
      typeof value !== 'object' ||
      (value as { schemaVersion?: unknown }).schemaVersion !== 1
    ) {
      throw new TypeError('Invalid AI credentials');
    }
    return this.normalizeAiApiKey((value as { apiKey?: unknown }).apiKey);
  }

  async saveAiApiKey(apiKey: string | null): Promise<void> {
    await this.appData.save(AI_CREDENTIALS_NAME, {
      schemaVersion: 1,
      apiKey: this.normalizeAiApiKey(apiKey),
    });
  }

  createGamePackage(value: DriveGamePackageWrite) {
    return this.uploadGamePackage(value);
  }

  updateGamePackage(fileId: string, value: DriveGamePackageWrite) {
    if (!isDriveFileId(fileId)) throw new TypeError('Invalid Drive file');
    return this.uploadGamePackage(value, fileId);
  }

  async deleteGamePackage(fileId: string): Promise<void> {
    if (!isDriveFileId(fileId)) throw new TypeError('Invalid Drive file');
    const encodedId = encodeURIComponent(fileId);
    const metadata = await this.request(
      `${DRIVE_API}/files/${encodedId}?fields=id,name,description,modifiedTime,appProperties`,
    );
    if (!parseDriveGamePackageFile(await metadata.json())) {
      throw new TypeError('Invalid Google Drive package');
    }
    await this.request(`${DRIVE_API}/files/${encodedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    });
  }

  async listGamePackages(): Promise<DriveGamePackageFile[]> {
    const folderId = await this.ensurePackageFolder();
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `'${folderId}' in parents and trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_PACKAGE_KIND}' }`,
      fields: 'files(id,name,description,modifiedTime,appProperties)',
      orderBy: 'modifiedTime desc',
      pageSize: '20',
    });
    const response = await this.request(`${DRIVE_API}/files?${query}`);
    const value = (await response.json()) as { files?: unknown[] };
    return (value.files ?? []).flatMap((file) => {
      const parsed = parseDriveGamePackageFile(file);
      return parsed ? [parsed] : [];
    });
  }

  async loadGamePackage(fileId: string): Promise<DriveGamePackage> {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    const encodedId = encodeURIComponent(fileId);
    const [metadataResponse, contentResponse] = await Promise.all([
      this.request(
        `${DRIVE_API}/files/${encodedId}?fields=id,name,description,modifiedTime,appProperties`,
      ),
      this.request(`${DRIVE_API}/files/${encodedId}?alt=media`),
    ]);
    const file = parseDriveGamePackageFile(await metadataResponse.json());
    if (!file) throw new Error('Google Drive package metadata is unavailable');
    return {
      ...file,
      content: new Uint8Array(await contentResponse.arrayBuffer()),
    };
  }

  private async uploadGamePackage(
    value: DriveGamePackageWrite,
    fileId?: string,
  ): Promise<DriveGamePackageFile> {
    if (!isDriveGamePackageName(value.name)) {
      throw new TypeError('Invalid Google Drive package name');
    }
    const metadata = {
      name: value.name,
      description: value.title,
      mimeType: DRIVE_PACKAGE_MIME_TYPE,
      appProperties: {
        [DRIVE_APP_KIND_KEY]: DRIVE_PACKAGE_KIND,
        ready: String(value.ready),
      },
      ...(fileId ? {} : { parents: [await this.ensurePackageFolder()] }),
    };
    const boundary = `schdk-${crypto.randomUUID()}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: ${DRIVE_PACKAGE_MIME_TYPE}\r\n\r\n`,
      new Uint8Array(value.content),
      `\r\n--${boundary}--`,
    ]);
    const target = fileId
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,description,modifiedTime,appProperties`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,description,modifiedTime,appProperties`;
    const response = await this.request(target, {
      method: fileId ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    const file = parseDriveGamePackageFile(await response.json());
    if (!file) throw new Error('Google Drive package metadata is unavailable');
    return file;
  }

  private async ensurePackageFolder() {
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `mimeType = '${DRIVE_FOLDER_MIME_TYPE}' and trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_FOLDER_KIND}' }`,
      fields: 'files(id)',
      pageSize: '1',
    });
    const response = await this.request(`${DRIVE_API}/files?${query}`);
    const value = (await response.json()) as { files?: DriveFile[] };
    const existing = value.files?.[0]?.id;
    if (isDriveFileId(existing)) return existing;
    const createdResponse = await this.request(`${DRIVE_API}/files?fields=id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: PACKAGE_FOLDER_NAME,
        mimeType: DRIVE_FOLDER_MIME_TYPE,
        appProperties: { [DRIVE_APP_KIND_KEY]: DRIVE_FOLDER_KIND },
      }),
    });
    const created = (await createdResponse.json()) as DriveFile;
    if (!isDriveFileId(created.id)) {
      throw new Error('Google Drive package folder is unavailable');
    }
    return created.id;
  }

  private normalizeAiApiKey(value: unknown) {
    if (value === null) return null;
    if (typeof value !== 'string') throw new TypeError('Invalid AI API key');
    const apiKey = value.trim();
    if (!apiKey || apiKey.length > MAX_AI_API_KEY_LENGTH) {
      throw new TypeError('Invalid AI API key');
    }
    return apiKey;
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
