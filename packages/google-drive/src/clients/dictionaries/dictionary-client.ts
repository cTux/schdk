import { parseSchdkDictionaryArchive } from '@schdk/common';
import {
  DRIVE_DICTIONARY_MIME_TYPE,
  GLOBAL_DICTIONARY_FOLDER_ID,
  MAX_SCHDK_DICTIONARY_BYTES,
  parseDriveDictionaryFile,
  parseDriveDictionaryWrite,
  createDictionaryFilename,
  type DriveDictionary,
  type DriveDictionaryFile,
  type DriveDictionaryStorage,
  type DriveDictionaryWrite,
} from '../../services/dictionaries/dictionaries.js';
import { isDriveFileId } from '../../services/settings/settings.js';
import { createDriveMultipartBody } from '../../utils/client/create-drive-multipart-body.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

class GoogleDriveDictionaryStorage implements DriveDictionaryStorage {
  constructor(private readonly request: DriveRequest) {}

  createDictionary(value: DriveDictionaryWrite) {
    return this.uploadDictionary(value);
  }

  async updateDictionary(fileId: string, value: DriveDictionaryWrite) {
    const { file } = await this.loadMetadata(fileId);
    if (!file || file.name !== value.name) {
      throw new TypeError('Invalid Google Drive dictionary');
    }
    return this.uploadDictionary(value, fileId);
  }

  async listDictionaries(): Promise<DriveDictionaryFile[]> {
    const query = new URLSearchParams({
      spaces: 'drive',
      q: `'${GLOBAL_DICTIONARY_FOLDER_ID}' in parents and trashed = false and name contains '.schdk-dictionary'`,
      fields: 'nextPageToken,files(id,name,modifiedTime)',
      orderBy: 'name_natural',
      pageSize: '100',
    });
    const files: DriveDictionaryFile[] = [];
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
          const parsed = parseDriveDictionaryFile(file);
          return parsed ? [parsed] : [];
        }),
      );
      pageToken = value.nextPageToken;
    } while (pageToken);
    return files;
  }

  async loadDictionary(fileId: string): Promise<DriveDictionary> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata.file || !metadata.validSize) {
      throw new Error('Invalid Google Drive dictionary');
    }
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
    );
    const content = new Uint8Array(await response.arrayBuffer());
    const dictionary = parseSchdkDictionaryArchive(content);
    if (createDictionaryFilename(dictionary.id) !== metadata.file.name) {
      throw new Error('Invalid Google Drive dictionary');
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    if (!isDriveFileId(fileId))
      throw new TypeError('Invalid Google Drive file');
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=id,name,modifiedTime,parents${includeSize ? ',size' : ''}`,
    );
    const value = (await response.json()) as Record<string, unknown>;
    const parsed = parseDriveDictionaryFile(value);
    const hasRequiredFolder =
      Array.isArray(value.parents) &&
      value.parents.includes(GLOBAL_DICTIONARY_FOLDER_ID);
    const size = Number(value.size);
    return {
      file: parsed && hasRequiredFolder ? parsed : null,
      validSize:
        !includeSize ||
        (typeof value.size === 'string' &&
          Number.isSafeInteger(size) &&
          size > 0 &&
          size <= MAX_SCHDK_DICTIONARY_BYTES),
    };
  }

  private async uploadDictionary(value: DriveDictionaryWrite, fileId?: string) {
    const parsed = parseDriveDictionaryWrite(value);
    if (!parsed) throw new TypeError('Invalid Google Drive dictionary');
    const metadata = {
      name: parsed.name,
      mimeType: DRIVE_DICTIONARY_MIME_TYPE,
      ...(fileId ? {} : { parents: [GLOBAL_DICTIONARY_FOLDER_ID] }),
    };
    const { body, contentType } = createDriveMultipartBody(
      metadata,
      DRIVE_DICTIONARY_MIME_TYPE,
      new Uint8Array(parsed.content),
    );
    const target = fileId
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(fileId)}?uploadType=multipart&fields=id,name,modifiedTime`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=id,name,modifiedTime`;
    const response = await this.request(target, {
      method: fileId ? 'PATCH' : 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
    const file = parseDriveDictionaryFile(await response.json());
    if (!file) throw new Error('Google Drive dictionary is unavailable');
    return file;
  }
}

export { GoogleDriveDictionaryStorage };
