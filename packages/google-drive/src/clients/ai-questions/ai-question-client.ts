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
import {
  DRIVE_APP_KIND_KEY,
  DRIVE_FOLDER_KIND,
  DRIVE_FOLDER_MIME_TYPE,
} from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const PACKAGE_FOLDER_NAME = 'SCHDK';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

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
    const folderId = await this.ensurePackageFolder();
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
      ...(fileId ? {} : { parents: [await this.ensurePackageFolder()] }),
    };
    const boundary = `schdk-${crypto.randomUUID()}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: ${DRIVE_AI_QUESTION_MIME_TYPE}\r\n\r\n`,
      new Uint8Array(value.content),
      `\r\n--${boundary}--`,
    ]);
    const target = fileId
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,modifiedTime,appProperties`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,modifiedTime,appProperties`;
    const response = await this.request(target, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': `multipart/related; boundary=${boundary}` },
      body,
    });
    const file = parseDriveAIQuestionFile(await response.json());
    if (!file) throw new Error('Google Drive AI question is unavailable');
    return file;
  }

  private async ensurePackageFolder() {
    if (this.folderId) return this.folderId;
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
