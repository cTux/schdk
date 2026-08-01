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
import {
  downloadDriveFile,
  hasValidDriveSize,
  listDriveFiles,
  loadDriveMetadata,
  uploadDriveFile,
  type DriveRequest,
} from '../../utils/client/drive-api.js';
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';

class GoogleDriveDictionaryStorage implements DriveDictionaryStorage {
  constructor(private readonly request: DriveRequest) {}

  createDictionary(value: DriveDictionaryWrite) {
    return this.uploadDictionary(value);
  }

  async updateDictionary(fileId: string, value: DriveDictionaryWrite) {
    const { file } = await this.loadMetadata(fileId);
    if (!file || file.name !== value.name) {
      throw new GoogleDriveError(
        'Invalid Google Drive dictionary',
        'invalid-data',
      );
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
    return listDriveFiles(this.request, query, parseDriveDictionaryFile);
  }

  async loadDictionary(fileId: string): Promise<DriveDictionary> {
    const metadata = await this.loadMetadata(fileId, true);
    if (!metadata.file || !metadata.validSize) {
      throw new GoogleDriveError(
        'Invalid Google Drive dictionary',
        'invalid-data',
      );
    }
    const content = await downloadDriveFile(
      this.request,
      fileId,
      MAX_SCHDK_DICTIONARY_BYTES,
    );
    if (!content) {
      throw new GoogleDriveError(
        'Invalid Google Drive dictionary',
        'invalid-data',
      );
    }
    const dictionary = parseSchdkDictionaryArchive(content);
    if (createDictionaryFilename(dictionary.id) !== metadata.file.name) {
      throw new GoogleDriveError(
        'Invalid Google Drive dictionary',
        'invalid-data',
      );
    }
    return { ...metadata.file, content };
  }

  private async loadMetadata(fileId: string, includeSize = false) {
    const value = await loadDriveMetadata(
      this.request,
      fileId,
      `id,name,modifiedTime,parents${includeSize ? ',size' : ''}`,
    );
    const parsed = parseDriveDictionaryFile(value);
    const hasRequiredFolder =
      Array.isArray(value.parents) &&
      value.parents.includes(GLOBAL_DICTIONARY_FOLDER_ID);
    return {
      file: parsed && hasRequiredFolder ? parsed : null,
      validSize:
        !includeSize ||
        hasValidDriveSize(value.size, MAX_SCHDK_DICTIONARY_BYTES),
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
    const response = await uploadDriveFile(this.request, {
      fileId,
      fields: 'id,name,modifiedTime',
      metadata,
      mimeType: DRIVE_DICTIONARY_MIME_TYPE,
      content: new Uint8Array(parsed.content),
    });
    const file = parseDriveDictionaryFile(await response.json());
    if (!file) {
      throw new GoogleDriveError(
        'Google Drive dictionary is unavailable',
        'unavailable',
      );
    }
    return file;
  }
}

export { GoogleDriveDictionaryStorage };
