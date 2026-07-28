export interface QuestionDatabaseRow {
  fileId: string;
  packageTitle: string;
  number: number;
  question: string;
  answer: string;
  alternativeAnswers: string[];
}

export interface QuestionDatabasePageProps {
  failed: boolean;
  hidden?: boolean;
  loading: boolean;
  progress: { current: number; total: number };
  rows: QuestionDatabaseRow[];
}
