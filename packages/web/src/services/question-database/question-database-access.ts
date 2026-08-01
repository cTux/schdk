import { type QuestionDatabaseEntry } from '@schdk/google-drive/question-database';

export interface QuestionDatabaseAccess {
  getEntries(): QuestionDatabaseEntry[];
  refresh(): Promise<QuestionDatabaseEntry[]>;
}
