export interface QuestionDatabaseRow {
  fileId: string;
  packageTitles: string[];
  number: number;
  question: string;
  answer: string;
  alternativeAnswers: string[];
}
