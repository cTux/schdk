import { type DriveAIQuestionsPackageFile } from './drive-ai-questions-package-file.js';

export interface DriveAIQuestionsPackage extends DriveAIQuestionsPackageFile {
  content: Uint8Array;
}
