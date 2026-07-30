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
  const hasValidIdentity =
    isDriveGamePackageName(candidate.name) &&
    typeof candidate.title === 'string';
  const hasValidContent = candidate.content instanceof Uint8Array;
  const hasValidState =
    typeof candidate.ready === 'boolean' &&
    typeof candidate.hasRemarks === 'boolean';
  if (!hasValidIdentity || !hasValidContent || !hasValidState) {
    return null;
  }
  const write = candidate as unknown as DriveGamePackageWrite;
  try {
    const gamePackage = parseGamePackage(write.content);
    const hasMatchingTitle = write.title.trim() === gamePackage.title;
    const hasMatchingReadyState =
      write.ready === (validateGamePackage(gamePackage).length === 0);
    const hasMatchingRemarksState =
      write.hasRemarks === hasGamePackageRemarks(gamePackage);
    if (
      !hasMatchingTitle ||
      !hasMatchingReadyState ||
      !hasMatchingRemarksState
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return {
    ...write,
    title: write.title.trim(),
  };
}
