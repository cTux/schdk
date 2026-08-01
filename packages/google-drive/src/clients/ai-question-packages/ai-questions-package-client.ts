import {
  MAX_AI_QUESTIONS_PACKAGE_BYTES,
  parseAIQuestionsPackageArchive,
} from '@schdk/common';
import {
  DRIVE_AI_QUESTIONS_PACKAGE_KIND,
  DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE,
  isDriveAIQuestionsPackageName,
  type DriveAIQuestionsPackage,
  type DriveAIQuestionsPackageFile,
  type DriveAIQuestionsPackageStorage,
  type DriveAIQuestionsPackageWrite,
} from '../../services/ai-question-packages/ai-questions-packages.js';
import { parseDriveAIQuestionsPackageFile } from '../../parsers/ai-question-packages/parse-drive-ai-questions-package-file.js';
import { DRIVE_APP_KIND_KEY } from '../../services/game-packages/game-packages.js';
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
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';

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
      throw new GoogleDriveError(
        'Invalid Google Drive AI package rule',
        'invalid-data',
      );
    }
    return this.upload(value, fileId);
  }

  async deleteAIQuestionsPackage(fileId: string): Promise<void> {
    if (!(await this.loadMetadata(fileId)).file) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI package rule',
        'invalid-data',
      );
    }
    await trashDriveFile(this.request, fileId);
  }

  async listAIQuestionsPackages(): Promise<DriveAIQuestionsPackageFile[]> {
    const folderId = await ensurePackageFolder(this.request);
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `'${folderId}' in parents and trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_AI_QUESTIONS_PACKAGE_KIND}' }`,
      fields: 'nextPageToken,files(id,name,modifiedTime,appProperties)',
      orderBy: 'name_natural',
      pageSize: '100',
    });
    return listDriveFiles(
      this.request,
      query,
      parseDriveAIQuestionsPackageFile,
    );
  }

  async loadAIQuestionsPackage(
    fileId: string,
  ): Promise<DriveAIQuestionsPackage> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata.file || !metadata.validSize) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI package rule',
        'invalid-data',
      );
    }
    const content = await downloadDriveFile(
      this.request,
      fileId,
      MAX_AI_QUESTIONS_PACKAGE_BYTES,
    );
    if (!content) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI package rule',
        'invalid-data',
      );
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    const value = await loadDriveMetadata(
      this.request,
      fileId,
      `id,name,modifiedTime,appProperties${includeSize ? ',size' : ''}`,
    );
    return {
      file: parseDriveAIQuestionsPackageFile(value),
      validSize:
        !includeSize ||
        hasValidDriveSize(value.size, MAX_AI_QUESTIONS_PACKAGE_BYTES),
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
      ...(fileId ? {} : { parents: [await ensurePackageFolder(this.request)] }),
    };
    const response = await uploadDriveFile(this.request, {
      fileId,
      fields: 'id,name,modifiedTime,appProperties',
      metadata,
      mimeType: DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE,
      content: new Uint8Array(value.content),
    });
    const file = parseDriveAIQuestionsPackageFile(await response.json());
    if (!file) {
      throw new GoogleDriveError(
        'Google Drive AI package rule is unavailable',
        'unavailable',
      );
    }
    return file;
  }
}
