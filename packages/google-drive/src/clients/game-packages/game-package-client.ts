import {
  DRIVE_APP_KIND_KEY,
  DRIVE_PACKAGE_KIND,
  DRIVE_PACKAGE_MIME_TYPE,
  parseDriveGamePackageFile,
  parseDriveGamePackageWrite,
  type DriveGamePackage,
  type DriveGamePackageFile,
  type DriveGamePackageWrite,
  type DrivePackageStorage,
} from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';
import {
  DRIVE_API,
  ensurePackageFolder,
  uploadDriveFile,
  type DriveRequest,
} from '../../utils/client/drive-api.js';

const MAX_GAME_PACKAGE_BYTES = 160 * 1024 * 1024;

export class GoogleDrivePackageStorage implements DrivePackageStorage {
  private listRequest: Promise<DriveGamePackageFile[]> | null = null;

  constructor(private readonly request: DriveRequest) {}

  createGamePackage(value: DriveGamePackageWrite) {
    return this.uploadGamePackage(value);
  }

  async updateGamePackage(
    fileId: string,
    expectedModifiedTime: string,
    value: DriveGamePackageWrite,
  ) {
    if (!isDriveFileId(fileId)) throw new TypeError('Invalid Drive file');
    if (!Number.isFinite(Date.parse(expectedModifiedTime))) {
      throw new TypeError('Invalid Drive modification time');
    }
    if (!parseDriveGamePackageWrite(value)) {
      throw new TypeError('Invalid Google Drive package');
    }
    const encodedId = encodeURIComponent(fileId);
    const metadata = await this.request(
      `${DRIVE_API}/files/${encodedId}?fields=id,name,description,modifiedTime,appProperties`,
    );
    const current = parseDriveGamePackageFile(await metadata.json());
    if (!current) throw new TypeError('Invalid Google Drive package');
    if (current.modifiedTime !== expectedModifiedTime) return null;
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

  listGamePackages(): Promise<DriveGamePackageFile[]> {
    return (this.listRequest ??= this.fetchGamePackages().finally(() => {
      this.listRequest = null;
    }));
  }

  private async fetchGamePackages(): Promise<DriveGamePackageFile[]> {
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_PACKAGE_KIND}' }`,
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
    const gamePackage = parseDriveGamePackageWrite(value);
    if (!gamePackage) {
      throw new TypeError('Invalid Google Drive package');
    }
    const metadata = {
      name: gamePackage.name,
      description: gamePackage.title,
      mimeType: DRIVE_PACKAGE_MIME_TYPE,
      appProperties: {
        [DRIVE_APP_KIND_KEY]: DRIVE_PACKAGE_KIND,
        ready: String(gamePackage.ready),
        hasRemarks: String(gamePackage.hasRemarks),
      },
      ...(fileId ? {} : { parents: [await ensurePackageFolder(this.request)] }),
    };
    const response = await uploadDriveFile(this.request, {
      fileId,
      fields: 'id,name,description,modifiedTime,appProperties',
      metadata,
      mimeType: DRIVE_PACKAGE_MIME_TYPE,
      content: new Uint8Array(gamePackage.content),
    });
    const file = parseDriveGamePackageFile(await response.json());
    if (!file) throw new Error('Google Drive package metadata is unavailable');
    return file;
  }
}
