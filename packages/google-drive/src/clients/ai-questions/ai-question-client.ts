import { MAX_AI_QUESTION_BYTES, parseAIQuestionArchive } from '@schdk/common';
import {
  DRIVE_AI_QUESTION_KIND,
  DRIVE_AI_QUESTION_MIME_TYPE,
  isDriveAIQuestionName,
  parseDriveAIQuestionFile,
  type DriveAIQuestion,
  type DriveAIQuestionFile,
  type DriveAIQuestionWrite,
  type DriveAIQuestionStorage,
} from '../../services/ai-questions/ai-questions.js';
import { DRIVE_APP_KIND_KEY } from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';
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

export class GoogleDriveAIQuestionStorage implements DriveAIQuestionStorage {
  constructor(
    private readonly request: DriveRequest,
    private readonly folderId?: string,
  ) {}

  createAIQuestion(value: DriveAIQuestionWrite) {
    return this.uploadAIQuestion(value);
  }

  async updateAIQuestion(fileId: string, value: DriveAIQuestionWrite) {
    const { file } = await this.loadMetadata(fileId);
    if (!file) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI question',
        'invalid-data',
      );
    }
    return this.uploadAIQuestion(value, fileId);
  }

  async deleteAIQuestion(fileId: string): Promise<void> {
    const { file } = await this.loadMetadata(fileId);
    if (!file) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI question',
        'invalid-data',
      );
    }
    await trashDriveFile(this.request, fileId);
  }

  async listAIQuestions(): Promise<DriveAIQuestionFile[]> {
    const folderId = this.folderId ?? (await ensurePackageFolder(this.request));
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `'${folderId}' in parents and trashed = false${this.folderId ? ` and name contains '.aiquestion'` : ` and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_AI_QUESTION_KIND}' }`}`,
      fields: 'nextPageToken,files(id,name,modifiedTime,appProperties)',
      orderBy: 'name_natural',
      pageSize: '100',
    });
    return listDriveFiles(this.request, query, (file) => this.parseFile(file));
  }

  async loadAIQuestion(fileId: string): Promise<DriveAIQuestion> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata?.file || !metadata.validSize) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI question',
        'invalid-data',
      );
    }
    const content = await downloadDriveFile(
      this.request,
      fileId,
      MAX_AI_QUESTION_BYTES,
    );
    if (!content) {
      throw new GoogleDriveError(
        'Invalid Google Drive AI question',
        'invalid-data',
      );
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    const value = await loadDriveMetadata(
      this.request,
      fileId,
      `id,name,modifiedTime,appProperties,parents${includeSize ? ',size' : ''}`,
    );
    const file = this.parseFile(value, true);
    return {
      file,
      validSize:
        !includeSize || hasValidDriveSize(value.size, MAX_AI_QUESTION_BYTES),
    };
  }

  private async uploadAIQuestion(value: DriveAIQuestionWrite, fileId?: string) {
    const hasValidName = isDriveAIQuestionName(value.name);
    const hasAcceptableSize = value.content.byteLength <= MAX_AI_QUESTION_BYTES;
    if (!hasValidName || !hasAcceptableSize) {
      throw new TypeError('Invalid Google Drive AI question');
    }
    parseAIQuestionArchive(value.content);
    const metadata = {
      name: value.name,
      mimeType: DRIVE_AI_QUESTION_MIME_TYPE,
      appProperties: {
        [DRIVE_APP_KIND_KEY]: DRIVE_AI_QUESTION_KIND,
      },
      ...(fileId
        ? {}
        : {
            parents: [
              this.folderId ?? (await ensurePackageFolder(this.request)),
            ],
          }),
    };
    const response = await uploadDriveFile(this.request, {
      fileId,
      fields: 'id,name,modifiedTime,appProperties',
      metadata,
      mimeType: DRIVE_AI_QUESTION_MIME_TYPE,
      content: new Uint8Array(value.content),
    });
    const file = parseDriveAIQuestionFile(await response.json());
    if (!file) {
      throw new GoogleDriveError(
        'Google Drive AI question is unavailable',
        'unavailable',
      );
    }
    return file;
  }

  private parseFile(
    value: unknown,
    requireFolder = false,
  ): DriveAIQuestionFile | null {
    if (!this.folderId) return parseDriveAIQuestionFile(value);
    if (!value || typeof value !== 'object') return null;
    const file = value as Record<string, unknown>;
    const hasValidIdentity =
      isDriveFileId(file.id) && isDriveAIQuestionName(file.name);
    const hasValidModifiedTime =
      typeof file.modifiedTime === 'string' &&
      Number.isFinite(Date.parse(file.modifiedTime));
    const hasRequiredFolder =
      !requireFolder ||
      (Array.isArray(file.parents) && file.parents.includes(this.folderId));
    const isValidFile =
      hasValidIdentity && hasValidModifiedTime && hasRequiredFolder;
    return isValidFile
      ? {
          id: file.id as string,
          name: file.name as string,
          modifiedTime: file.modifiedTime as string,
        }
      : null;
  }
}
