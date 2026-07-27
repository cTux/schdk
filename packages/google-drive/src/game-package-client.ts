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
import { isDriveFileId } from './settings.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const MAX_GAME_PACKAGE_BYTES = 160 * 1024 * 1024;
const PACKAGE_FOLDER_NAME = 'SCHDK';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

export class GoogleDrivePackageStorage implements DrivePackageStorage {
  constructor(private readonly request: DriveRequest) {}

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
      fields:
        'nextPageToken,files(id,name,description,modifiedTime,appProperties)',
      orderBy: 'modifiedTime desc',
      pageSize: '100',
    });
    const files: DriveGamePackageFile[] = [];
    let pageToken: string | undefined;
    do {
      if (pageToken) query.set('pageToken', pageToken);
      const response = await this.request(`${DRIVE_API}/files?${query}`);
      const value = (await response.json()) as {
        files?: unknown[];
        nextPageToken?: string;
      };
      files.push(
        ...(value.files ?? []).flatMap((file) => {
          const parsed = parseDriveGamePackageFile(file);
          return parsed ? [parsed] : [];
        }),
      );
      pageToken = value.nextPageToken;
    } while (pageToken);
    return files;
  }

  async loadGamePackage(fileId: string): Promise<DriveGamePackage> {
    if (!isDriveFileId(fileId)) {
      throw new TypeError('Invalid Google Drive file');
    }
    const encodedId = encodeURIComponent(fileId);
    const metadataResponse = await this.request(
      `${DRIVE_API}/files/${encodedId}?fields=id,name,description,modifiedTime,appProperties,size`,
    );
    const metadata = (await metadataResponse.json()) as Record<string, unknown>;
    const file = parseDriveGamePackageFile(metadata);
    const size = Number(metadata.size);
    const validSize =
      typeof metadata.size === 'string' &&
      Number.isSafeInteger(size) &&
      size >= 0 &&
      size <= MAX_GAME_PACKAGE_BYTES;
    if (!file || !validSize) throw new Error('Invalid Google Drive package');
    const contentResponse = await this.request(
      `${DRIVE_API}/files/${encodedId}?alt=media`,
    );
    const content = new Uint8Array(await contentResponse.arrayBuffer());
    if (content.byteLength > MAX_GAME_PACKAGE_BYTES) {
      throw new Error('Invalid Google Drive package');
    }
    return { ...file, content };
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
    const value = (await response.json()) as { files?: { id?: unknown }[] };
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
    const created = (await createdResponse.json()) as { id?: unknown };
    if (!isDriveFileId(created.id)) {
      throw new Error('Google Drive package folder is unavailable');
    }
    return created.id;
  }
}
