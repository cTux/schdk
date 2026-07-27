import { isDriveFileId } from './settings.js';

const AI_QUESTIONS_PACKAGE_EXTENSION = '.aiquestionpackage';
const MAX_DRIVE_FILE_NAME_LENGTH = 256;
export const DRIVE_AI_QUESTIONS_PACKAGE_KIND = 'ai-questions-package';
export const DRIVE_AI_QUESTIONS_PACKAGE_MIME_TYPE =
  'application/vnd.schdk.ai-questions-package';

export interface DriveAIQuestionsPackageFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface DriveAIQuestionsPackage extends DriveAIQuestionsPackageFile {
  content: Uint8Array;
}

export interface DriveAIQuestionsPackageWrite {
  name: string;
  content: Uint8Array;
}

export interface DriveAIQuestionsPackageStorage {
  createAIQuestionsPackage(
    value: DriveAIQuestionsPackageWrite,
  ): Promise<DriveAIQuestionsPackageFile>;
  updateAIQuestionsPackage(
    fileId: string,
    value: DriveAIQuestionsPackageWrite,
  ): Promise<DriveAIQuestionsPackageFile>;
  deleteAIQuestionsPackage(fileId: string): Promise<void>;
  listAIQuestionsPackages(): Promise<DriveAIQuestionsPackageFile[]>;
  loadAIQuestionsPackage(fileId: string): Promise<DriveAIQuestionsPackage>;
}

export function createAIQuestionsPackageFilename(name: string) {
  const safeName =
    name.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || 'AI package rule';
  return `${safeName
    .slice(
      0,
      MAX_DRIVE_FILE_NAME_LENGTH - AI_QUESTIONS_PACKAGE_EXTENSION.length,
    )
    .trimEnd()}${AI_QUESTIONS_PACKAGE_EXTENSION}`;
}

export function isDriveAIQuestionsPackageName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > AI_QUESTIONS_PACKAGE_EXTENSION.length &&
    value.length <= MAX_DRIVE_FILE_NAME_LENGTH &&
    /\.aiquestionpackage$/iu.test(value)
  );
}

export function parseDriveAIQuestionsPackageWrite(
  value: unknown,
): DriveAIQuestionsPackageWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveAIQuestionsPackageName(candidate.name) &&
    candidate.content instanceof Uint8Array
    ? { name: candidate.name, content: candidate.content }
    : null;
}

export function parseDriveAIQuestionsPackageFile(
  value: unknown,
): DriveAIQuestionsPackageFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  return isDriveFileId(file.id) &&
    isDriveAIQuestionsPackageName(file.name) &&
    properties.schdkType === DRIVE_AI_QUESTIONS_PACKAGE_KIND &&
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime))
    ? {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      }
    : null;
}
