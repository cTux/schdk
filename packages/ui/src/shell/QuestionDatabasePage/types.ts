import { type QuestionDatabasePageProps } from './question-database-page-props';

interface QuestionDatabaseRow {
  fileId: string;
  packageTitles: string[];
  number: number;
  question: string;
  answer: string;
  alternativeAnswers: string[];
}

export { type QuestionDatabaseRow, type QuestionDatabasePageProps };
