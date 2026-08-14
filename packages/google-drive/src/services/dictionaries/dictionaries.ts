import {
  MAX_SCHDK_DICTIONARY_BYTES,
  parseSchdkDictionaryArchive,
  type SchdkDictionaryId,
} from '@schdk/common';
import { isDriveFileId } from '../settings/settings.js';

const DRIVE_DICTIONARY_MIME_TYPE = 'application/vnd.schdk.dictionary+zip';
const SCHDK_DICTIONARY_EXTENSION = '.schdk-dictionary';

interface DriveDictionaryFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface DriveDictionary extends DriveDictionaryFile {
  content: Uint8Array;
}

interface DriveDictionaryWrite {
  name: string;
  content: Uint8Array;
}

interface DriveDictionaryStorage {
  createDictionary(value: DriveDictionaryWrite): Promise<DriveDictionaryFile>;
  updateDictionary(
    fileId: string,
    value: DriveDictionaryWrite,
  ): Promise<DriveDictionaryFile>;
  listDictionaries(): Promise<DriveDictionaryFile[]>;
  loadDictionary(fileId: string): Promise<DriveDictionary>;
}

function createDictionaryFilename(id: SchdkDictionaryId) {
  return `${id}${SCHDK_DICTIONARY_EXTENSION}`;
}

function isDriveDictionaryName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length <= 500 &&
    /^(question-difficulty|question-recognizability|question-difficulty-distribution|question-recognizability-distribution)\.schdk-dictionary$/u.test(
      value,
    )
  );
}

function parseDriveDictionaryFile(value: unknown): DriveDictionaryFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const hasValidModifiedTime =
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime));
  return isDriveFileId(file.id) &&
    isDriveDictionaryName(file.name) &&
    hasValidModifiedTime
    ? {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime as string,
      }
    : null;
}

function parseDriveDictionaryWrite(
  value: unknown,
): DriveDictionaryWrite | null {
  if (!value || typeof value !== 'object') return null;
  const write = value as Record<string, unknown>;
  if (
    !isDriveDictionaryName(write.name) ||
    !(write.content instanceof Uint8Array) ||
    write.content.byteLength > MAX_SCHDK_DICTIONARY_BYTES
  ) {
    return null;
  }
  try {
    const dictionary = parseSchdkDictionaryArchive(write.content);
    return createDictionaryFilename(dictionary.id) === write.name
      ? { name: write.name, content: write.content }
      : null;
  } catch {
    return null;
  }
}

export {
  DRIVE_DICTIONARY_MIME_TYPE,
  MAX_SCHDK_DICTIONARY_BYTES,
  SCHDK_DICTIONARY_EXTENSION,
  createDictionaryFilename,
  isDriveDictionaryName,
  parseDriveDictionaryFile,
  parseDriveDictionaryWrite,
  type DriveDictionary,
  type DriveDictionaryFile,
  type DriveDictionaryStorage,
  type DriveDictionaryWrite,
};
