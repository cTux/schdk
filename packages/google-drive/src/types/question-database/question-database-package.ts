import { type QuestionDatabaseQuestion } from './question-database-question.js';

export interface QuestionDatabasePackage {
  fileId: string;
  modifiedTime: string;
  title: string;
  questions: QuestionDatabaseQuestion[];
}
