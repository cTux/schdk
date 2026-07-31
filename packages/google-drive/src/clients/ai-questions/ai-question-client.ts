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
  DRIVE_API,
  ensurePackageFolder,
  uploadDriveFile,
  type DriveRequest,
} from '../../utils/client/drive-api.js';

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
    if (!file) throw new TypeError('Invalid Google Drive AI question');
    return this.uploadAIQuestion(value, fileId);
  }

  async deleteAIQuestion(fileId: string): Promise<void> {
    const { file } = await this.loadMetadata(fileId);
    if (!file) throw new TypeError('Invalid Google Drive AI question');
    await this.request(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trashed: true }),
    });
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
    const files: DriveAIQuestionFile[] = [];
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
          const parsed = this.parseFile(file);
          return parsed ? [parsed] : [];
        }),
      );
      pageToken = value.nextPageToken;
    } while (pageToken);
    return files;
  }

  async loadAIQuestion(fileId: string): Promise<DriveAIQuestion> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata?.file || !metadata.validSize) {
      throw new Error('Invalid Google Drive AI question');
    }
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
    );
    const content = new Uint8Array(await response.arrayBuffer());
    if (content.byteLength > MAX_AI_QUESTION_BYTES) {
      throw new Error('Invalid Google Drive AI question');
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    if (!isDriveFileId(fileId)) {
      throw new TypeError('Invalid Google Drive file');
    }
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,modifiedTime,appProperties,parents${includeSize ? ',size' : ''}`,
    );
    const value = (await response.json()) as Record<string, unknown>;
    const file = this.parseFile(value, true);
    const size = Number(value.size);
    return {
      file,
      validSize:
        !includeSize ||
        (typeof value.size === 'string' &&
          Number.isSafeInteger(size) &&
          size > 0 &&
          size <= MAX_AI_QUESTION_BYTES),
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
    if (!file) throw new Error('Google Drive AI question is unavailable');
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
