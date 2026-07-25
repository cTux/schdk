import { isDriveFileId } from './settings.js';

const DRIVE_REFERENCE_PREFIX = 'drive:';
export const DRIVE_FOLDER_MIME_TYPE = 'application/vnd.google-apps.folder';
export const DRIVE_PACKAGE_MIME_TYPE = 'application/vnd.schdk.game-package';
export const DRIVE_APP_KIND_KEY = 'schdkType';
export const DRIVE_PACKAGE_KIND = 'game-package';
export const DRIVE_FOLDER_KIND = 'package-folder';

export interface DriveGamePackageFile {
  id: string;
  name: string;
  modifiedTime: string;
  ready?: boolean;
}

export interface DriveGamePackage extends DriveGamePackageFile {
  content: Uint8Array;
}

export interface DriveGamePackageWrite {
  name: string;
  content: Uint8Array;
  ready: boolean;
}

export interface DrivePackageStorage {
  createGamePackage(
    value: DriveGamePackageWrite,
  ): Promise<DriveGamePackageFile>;
  updateGamePackage(
    fileId: string,
    value: DriveGamePackageWrite,
  ): Promise<DriveGamePackageFile>;
  listGamePackages(): Promise<DriveGamePackageFile[]>;
  loadGamePackage(fileId: string): Promise<DriveGamePackage>;
}

export function isDriveGamePackageName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 256 &&
    /\.schdk$/iu.test(value)
  );
}

export function parseDriveGamePackageWrite(
  value: unknown,
): DriveGamePackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveGamePackageName(candidate.name) &&
    candidate.content instanceof Uint8Array &&
    typeof candidate.ready === 'boolean'
    ? {
        name: candidate.name,
        content: candidate.content,
        ready: candidate.ready,
      }
    : null;
}

export function parseDriveGamePackageFile(
  value: unknown,
): DriveGamePackageFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  if (
    !isDriveFileId(file.id) ||
    !isDriveGamePackageName(file.name) ||
    properties[DRIVE_APP_KIND_KEY] !== DRIVE_PACKAGE_KIND ||
    typeof file.modifiedTime !== 'string' ||
    !Number.isFinite(Date.parse(file.modifiedTime))
  ) {
    return null;
  }
  return {
    id: file.id,
    name: file.name,
    modifiedTime: file.modifiedTime,
    ...(properties.ready === 'true'
      ? { ready: true }
      : properties.ready === 'false'
        ? { ready: false }
        : {}),
  };
}

export function toDrivePackageReference(fileId: string) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  return `${DRIVE_REFERENCE_PREFIX}${fileId}`;
}

export function parseDrivePackageReference(value: unknown): string | null {
  if (typeof value !== 'string' || !value.startsWith(DRIVE_REFERENCE_PREFIX)) {
    return null;
  }
  const fileId = value.slice(DRIVE_REFERENCE_PREFIX.length);
  return isDriveFileId(fileId) ? fileId : null;
}
