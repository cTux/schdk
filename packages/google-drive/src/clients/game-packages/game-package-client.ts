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
import {
  downloadDriveFile,
  ensurePackageFolder,
  hasValidDriveSize,
  listDriveFiles,
  loadDriveMetadata,
  trashDriveFile,
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
    if (!Number.isFinite(Date.parse(expectedModifiedTime))) {
      throw new TypeError('Invalid Drive modification time');
    }
    if (!parseDriveGamePackageWrite(value)) {
      throw new TypeError('Invalid Google Drive package');
    }
    const metadata = await loadDriveMetadata(
      this.request,
      fileId,
      'id,name,description,modifiedTime,appProperties',
    );
    const current = parseDriveGamePackageFile(metadata);
    if (!current) throw new TypeError('Invalid Google Drive package');
    if (current.modifiedTime !== expectedModifiedTime) return null;
    return this.uploadGamePackage(value, fileId);
  }

  async deleteGamePackage(fileId: string): Promise<void> {
    const metadata = await loadDriveMetadata(
      this.request,
      fileId,
      'id,name,description,modifiedTime,appProperties',
    );
    if (!parseDriveGamePackageFile(metadata)) {
      throw new TypeError('Invalid Google Drive package');
    }
    await trashDriveFile(this.request, fileId);
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
    return listDriveFiles(this.request, query, parseDriveGamePackageFile);
  }

  async loadGamePackage(fileId: string): Promise<DriveGamePackage> {
    const metadata = await loadDriveMetadata(
      this.request,
      fileId,
      'id,name,description,modifiedTime,appProperties,size',
    );
    const file = parseDriveGamePackageFile(metadata);
    const validSize = hasValidDriveSize(
      metadata.size,
      MAX_GAME_PACKAGE_BYTES,
      0,
    );
    if (!file || !validSize) throw new Error('Invalid Google Drive package');
    const content = await downloadDriveFile(
      this.request,
      fileId,
      MAX_GAME_PACKAGE_BYTES,
    );
    if (!content) {
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
