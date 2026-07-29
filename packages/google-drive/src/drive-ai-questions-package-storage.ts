import { type DriveAIQuestionsPackageWrite } from './drive-ai-questions-package-write.js';
import { type DriveAIQuestionsPackageFile } from './drive-ai-questions-package-file.js';
import { type DriveAIQuestionsPackage } from './drive-ai-questions-package.js';

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
