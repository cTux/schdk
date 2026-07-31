import { type DriveAIQuestionWrite } from './drive-ai-question-write.js';
import { type DriveAIQuestionFile } from './drive-ai-question-file.js';
import { type DriveAIQuestion } from './drive-ai-question.js';

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
