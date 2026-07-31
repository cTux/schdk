import { type QuestionDatabaseDocument } from './question-database-document.js';

export interface DriveQuestionDatabaseStorage {
  loadQuestionDatabase(): Promise<QuestionDatabaseDocument | null>;
  saveQuestionDatabase(value: QuestionDatabaseDocument): Promise<void>;
}
