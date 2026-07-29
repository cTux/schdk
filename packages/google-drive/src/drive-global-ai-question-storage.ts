import { type DriveAIQuestionWrite } from './drive-ai-question-write.js';
import { type DriveAIQuestionFile } from './drive-ai-question-file.js';
import { type DriveAIQuestion } from './drive-ai-question.js';

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
