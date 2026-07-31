import {
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackageArchive,
} from '@schdk/common';
import {
  DRIVE_AI_QUESTIONS_PACKAGE_KIND,
  DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE,
  isDriveAIQuestionsPackageName,
  parseDriveAIQuestionsPackageFile,
  type DriveAIQuestionsPackage,
  type DriveAIQuestionsPackageFile,
  type DriveAIQuestionsPackageStorage,
  type DriveAIQuestionsPackageWrite,
} from '../../services/ai-question-packages/ai-questions-packages.js';
import {
  DRIVE_APP_KIND_KEY,
  DRIVE_FOLDER_KIND,
  DRIVE_FOLDER_MIME_TYPE,
} from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';
import { createDriveMultipartBody } from '../../utils/client/create-drive-multipart-body.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const PACKAGE_FOLDER_NAME = 'SCHDK';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

export class GoogleDriveAIQuestionsPackageStorage implements DriveAIQuestionsPackageStorage {
  constructor(private readonly request: DriveRequest) {}

  createAIQuestionsPackage(value: DriveAIQuestionsPackageWrite) {
    return this.upload(value);
  }

  async updateAIQuestionsPackage(
    fileId: string,
    value: DriveAIQuestionsPackageWrite,
  ) {
    if (!(await this.loadMetadata(fileId)).file) {
      throw new TypeError('Invalid Google Drive AI package rule');
    }
    return this.upload(value, fileId);
  }

  async deleteAIQuestionsPackage(fileId: string): Promise<void> {
    if (!(await this.loadMetadata(fileId)).file) {
      throw new TypeError('Invalid Google Drive AI package rule');
    }
    await this.request(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    });
  }

  async listAIQuestionsPackages(): Promise<DriveAIQuestionsPackageFile[]> {
    const folderId = await this.ensurePackageFolder();
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `'${folderId}' in parents and trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_AI_QUESTIONS_PACKAGE_KIND}' }`,
      fields: 'nextPageToken,files(id,name,modifiedTime,appProperties)',
      orderBy: 'name_natural',
      pageSize: '100',
    });
    const files: DriveAIQuestionsPackageFile[] = [];
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
          const parsed = parseDriveAIQuestionsPackageFile(file);
          return parsed ? [parsed] : [];
        }),
      );
      pageToken = value.nextPageToken;
    } while (pageToken);
    return files;
  }

  async loadAIQuestionsPackage(
    fileId: string,
  ): Promise<DriveAIQuestionsPackage> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata.file || !metadata.validSize) {
      throw new Error('Invalid Google Drive AI package rule');
    }
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
    );
    const content = new Uint8Array(await response.arrayBuffer());
    if (content.byteLength > MAX_AI_QUESTIONS_PACKAGE_BYTES) {
      throw new Error('Invalid Google Drive AI package rule');
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    if (!isDriveFileId(fileId)) {
      throw new TypeError('Invalid Google Drive file');
    }
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,modifiedTime,appProperties${includeSize ? ',size' : ''}`,
    );
    const value = (await response.json()) as Record<string, unknown>;
    const size = Number(value.size);
    return {
      file: parseDriveAIQuestionsPackageFile(value),
      validSize:
        !includeSize ||
        (typeof value.size === 'string' &&
          Number.isSafeInteger(size) &&
          size > 0 &&
          size <= MAX_AI_QUESTIONS_PACKAGE_BYTES),
    };
  }

  private async upload(value: DriveAIQuestionsPackageWrite, fileId?: string) {
    if (
      !isDriveAIQuestionsPackageName(value.name) ||
      value.content.byteLength > MAX_AI_QUESTIONS_PACKAGE_BYTES
    ) {
      throw new TypeError('Invalid Google Drive AI package rule');
    }
    parseAIQuestionsPackageArchive(value.content);
    const metadata = {
      name: value.name,
      mimeType: DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE,
      appProperties: {
        [DRIVE_APP_KIND_KEY]: DRIVE_AI_QUESTIONS_PACKAGE_KIND,
      },
      ...(fileId ? {} : { parents: [await this.ensurePackageFolder()] }),
    };
    const { body, contentType } = createDriveMultipartBody(
      metadata,
      DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE,
      new Uint8Array(value.content),
    );
    const target = fileId
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,modifiedTime,appProperties`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,modifiedTime,appProperties`;
    const response = await this.request(target, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
    const file = parseDriveAIQuestionsPackageFile(await response.json());
    if (!file) throw new Error('Google Drive AI package rule is unavailable');
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
    const created = await this.request(`${DRIVE_API}/files?fields=id`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: PACKAGE_FOLDER_NAME,
        mimeType: DRIVE_FOLDER_MIME_TYPE,
        appProperties: { [DRIVE_APP_KIND_KEY]: DRIVE_FOLDER_KIND },
      }),
    });
    const file = (await created.json()) as { id?: unknown };
    if (!isDriveFileId(file.id)) {
      throw new Error('Google Drive package folder is unavailable');
    }
    return file.id;
  }
}
