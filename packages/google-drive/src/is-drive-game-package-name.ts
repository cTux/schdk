import { MAX_DRIVE_PACKAGE_NAME_LENGTH } from './max-drive-package-name-length.js';

export function isDriveGamePackageName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= MAX_DRIVE_PACKAGE_NAME_LENGTH &&
    /\.schdk$/iu.test(value)
  );
}
