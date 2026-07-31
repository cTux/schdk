import { strFromU8, unzipSync } from 'fflate';
import {
  MAX_SCHDK_DICTIONARY_BYTES,
  MAX_SCHDK_DICTIONARY_JSON_BYTES,
  SCHDK_DICTIONARY_ENTRY,
  parseSchdkDictionary,
  type SchdkDictionary,
} from './schdk-dictionary.js';

export function parseSchdkDictionaryArchive(
  content: Uint8Array,
): SchdkDictionary {
  if (
    content.byteLength > MAX_SCHDK_DICTIONARY_BYTES ||
    content[0] !== 0x50 ||
    content[1] !== 0x4b
  ) {
    throw new Error('Invalid SCHDK dictionary');
  }
  let entry: Uint8Array | undefined;
  let found = false;
  try {
    entry = unzipSync(content, {
      filter: ({ name, originalSize }) => {
        if (name !== SCHDK_DICTIONARY_ENTRY) return false;
        if (found || originalSize > MAX_SCHDK_DICTIONARY_JSON_BYTES) {
          throw new Error('Invalid SCHDK dictionary');
        }
        found = true;
        return true;
      },
    })[SCHDK_DICTIONARY_ENTRY];
  } catch {
    throw new Error('Invalid SCHDK dictionary');
  }
  if (!entry) throw new Error('Invalid SCHDK dictionary');
  const value: unknown = JSON.parse(strFromU8(entry));
  const archive = value as Record<string, unknown>;
  const dictionary =
    value &&
    typeof value === 'object' &&
    archive.format === 'schdk-dictionary' &&
    archive.version === 1
      ? parseSchdkDictionary(value)
      : null;
  if (!dictionary) throw new Error('Invalid SCHDK dictionary');
  return dictionary;
}
