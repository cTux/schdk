import { type DriveGamePackageWrite } from './drive-game-package-write.js';
import { isDriveGamePackageName } from './is-drive-game-package-name.js';

export function parseDriveGamePackageWrite(
  value: unknown,
): DriveGamePackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveGamePackageName(candidate.name) &&
    typeof candidate.title === 'string' &&
    candidate.content instanceof Uint8Array &&
    typeof candidate.ready === 'boolean' &&
    typeof candidate.hasRemarks === 'boolean'
    ? {
        name: candidate.name,
        title: candidate.title,
        content: candidate.content,
        ready: candidate.ready,
        hasRemarks: candidate.hasRemarks,
      }
    : null;
}
