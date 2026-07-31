import { type QuestionDatabaseRow } from '../../question-database/question-database-row';

export interface QuestionDatabasePageProps {
  failed: boolean;
  hidden?: boolean;
  loading: boolean;
  onBack(): void;
  progress: { current: number; total: number };
  rows: QuestionDatabaseRow[];
}
