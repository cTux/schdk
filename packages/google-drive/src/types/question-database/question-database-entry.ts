import { type QuestionDatabaseQuestion } from './question-database-question.js';

export interface QuestionDatabaseEntry extends QuestionDatabaseQuestion {
  fileId: string;
  packageTitles: string[];
}
