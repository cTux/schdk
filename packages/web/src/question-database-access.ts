import { type QuestionDatabaseEntry } from '@schdk/google-drive';

export interface QuestionDatabaseAccess {
  getEntries(): QuestionDatabaseEntry[];
  refresh(): Promise<QuestionDatabaseEntry[]>;
}
