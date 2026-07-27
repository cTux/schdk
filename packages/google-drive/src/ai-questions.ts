import { isDriveFileId } from './settings.js';

const AI_QUESTION_EXTENSION = '.aiquestion';
const MAX_DRIVE_FILE_NAME_LENGTH = 256;
export const GLOBAL_AI_QUESTION_FOLDER_ID = '1qigJtM0zAQl2Yk8C2xjeragcGDybUVR1';
export const GLOBAL_AI_QUESTION_ADMIN_EMAILS = ['ccctux@gmail.com'] as const;
export const DRIVE_AI_QUESTION_KIND = 'ai-question';
export const DRIVE_AI_QUESTION_MIME_TYPE = 'application/vnd.schdk.ai-question';

export interface DriveAIQuestionFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export interface DriveAIQuestion extends DriveAIQuestionFile {
  content: Uint8Array;
}

export interface DriveAIQuestionWrite {
  name: string;
  content: Uint8Array;
}

export interface DriveAIQuestionStorage {
  createAIQuestion(value: DriveAIQuestionWrite): Promise<DriveAIQuestionFile>;
  updateAIQuestion(
    fileId: string,
    value: DriveAIQuestionWrite,
  ): Promise<DriveAIQuestionFile>;
  deleteAIQuestion(fileId: string): Promise<void>;
  listAIQuestions(): Promise<DriveAIQuestionFile[]>;
  loadAIQuestion(fileId: string): Promise<DriveAIQuestion>;
}

export interface DriveGlobalAIQuestionStorage {
  createGlobalAIQuestion(
    value: DriveAIQuestionWrite,
  ): Promise<DriveAIQuestionFile>;
  updateGlobalAIQuestion(
    fileId: string,
    value: DriveAIQuestionWrite,
  ): Promise<DriveAIQuestionFile>;
  deleteGlobalAIQuestion(fileId: string): Promise<void>;
  listGlobalAIQuestions(): Promise<DriveAIQuestionFile[]>;
  loadGlobalAIQuestion(fileId: string): Promise<DriveAIQuestion>;
}

export function createAIQuestionFilename(name: string) {
  const safeName =
    name.replace(/[\p{Cc}<>:"/\\|?*]/gu, '-').trim() || 'AI question';
  return `${safeName
    .slice(0, MAX_DRIVE_FILE_NAME_LENGTH - AI_QUESTION_EXTENSION.length)
    .trimEnd()}${AI_QUESTION_EXTENSION}`;
}

export function isDriveAIQuestionName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > AI_QUESTION_EXTENSION.length &&
    value.length <= MAX_DRIVE_FILE_NAME_LENGTH &&
    /\.aiquestion$/iu.test(value)
  );
}

export function parseDriveAIQuestionWrite(
  value: unknown,
): DriveAIQuestionWrite | null {
  if (!value || typeof value !== 'object') return null;
  const candidate = value as Record<string, unknown>;
  return isDriveAIQuestionName(candidate.name) &&
    candidate.content instanceof Uint8Array
    ? { name: candidate.name, content: candidate.content }
    : null;
}

export function parseDriveAIQuestionFile(
  value: unknown,
): DriveAIQuestionFile | null {
  if (!value || typeof value !== 'object') return null;
  const file = value as Record<string, unknown>;
  const properties =
    file.appProperties && typeof file.appProperties === 'object'
      ? (file.appProperties as Record<string, unknown>)
      : {};
  return isDriveFileId(file.id) &&
    isDriveAIQuestionName(file.name) &&
    properties.schdkType === DRIVE_AI_QUESTION_KIND &&
    typeof file.modifiedTime === 'string' &&
    Number.isFinite(Date.parse(file.modifiedTime))
    ? {
        id: file.id,
        name: file.name,
        modifiedTime: file.modifiedTime,
      }
    : null;
}

export function isGlobalAIQuestionAdmin(emailAddress?: string) {
  return GLOBAL_AI_QUESTION_ADMIN_EMAILS.some(
    (email) => email === emailAddress?.toLowerCase(),
  );
}
