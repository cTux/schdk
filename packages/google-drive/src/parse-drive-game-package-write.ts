import {
  hasGamePackageRemarks,
  parseGamePackage,
  validateGamePackage,
} from '@schdk/common';
import { type DriveGamePackageWrite } from './drive-game-package-write.js';
import { isDriveGamePackageName } from './is-drive-game-package-name.js';

export function parseDriveGamePackageWrite(
  value: unknown,
): DriveGamePackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  if (
    !isDriveGamePackageName(candidate.name) ||
    typeof candidate.title !== 'string' ||
    !(candidate.content instanceof Uint8Array) ||
    typeof candidate.ready !== 'boolean' ||
    typeof candidate.hasRemarks !== 'boolean'
  ) {
    return null;
  }
  try {
    const gamePackage = parseGamePackage(candidate.content);
    if (
      candidate.title.trim() !== gamePackage.title ||
      candidate.ready !== (validateGamePackage(gamePackage).length === 0) ||
      candidate.hasRemarks !== hasGamePackageRemarks(gamePackage)
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return {
    name: candidate.name,
    title: candidate.title.trim(),
    content: candidate.content,
    ready: candidate.ready,
    hasRemarks: candidate.hasRemarks,
  };
}
