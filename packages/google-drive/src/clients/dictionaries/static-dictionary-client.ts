import {
  DEFAULT_SCHDK_DICTIONARIES,
  serializeSchdkDictionary,
} from '@schdk/common';
import { GoogleDriveAuthorizationError } from '../../errors/client/google-drive-authorization-error.js';
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';
import {
  createDictionaryFilename,
  type DriveDictionary,
  type DriveDictionaryFile,
  type DriveDictionaryStorage,
  type DriveDictionaryWrite,
} from '../../services/dictionaries/dictionaries.js';

const BUNDLED_MODIFIED_TIME = '2026-08-14T00:00:00.000Z';
const BUNDLED_DICTIONARIES = DEFAULT_SCHDK_DICTIONARIES.map((dictionary) => ({
  file: {
    id: `bundled-dictionary-${dictionary.id}`,
    name: createDictionaryFilename(dictionary.id),
    modifiedTime: BUNDLED_MODIFIED_TIME,
  },
  content: serializeSchdkDictionary(dictionary),
}));

class StaticDictionaryStorage implements DriveDictionaryStorage {
  async createDictionary(
    _value: DriveDictionaryWrite,
  ): Promise<DriveDictionaryFile> {
    throw new GoogleDriveAuthorizationError(
      'Bundled dictionaries are read-only',
    );
  }

  async updateDictionary(
    _fileId: string,
    _value: DriveDictionaryWrite,
  ): Promise<DriveDictionaryFile> {
    throw new GoogleDriveAuthorizationError(
      'Bundled dictionaries are read-only',
    );
  }

  async listDictionaries(): Promise<DriveDictionaryFile[]> {
    return BUNDLED_DICTIONARIES.map(({ file }) => ({ ...file }));
  }

  async loadDictionary(fileId: string): Promise<DriveDictionary> {
    const bundled = BUNDLED_DICTIONARIES.find(({ file }) => file.id === fileId);
    if (!bundled) {
      throw new GoogleDriveError('Invalid bundled dictionary', 'invalid-data');
    }
    return { ...bundled.file, content: new Uint8Array(bundled.content) };
  }
}

export { StaticDictionaryStorage };
