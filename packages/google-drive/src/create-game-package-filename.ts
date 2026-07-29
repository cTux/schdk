import { MAX_DRIVE_PACKAGE_NAME_LENGTH } from './max-drive-package-name-length.js';

const DRIVE_PACKAGE_EXTENSION = '.schdk';

export function createGamePackageFilename(title: string, fallback: string) {
  const safeTitle =
    title.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || fallback;
  return `${safeTitle
    .slice(0, MAX_DRIVE_PACKAGE_NAME_LENGTH - DRIVE_PACKAGE_EXTENSION.length)
    .trimEnd()}${DRIVE_PACKAGE_EXTENSION}`;
}
