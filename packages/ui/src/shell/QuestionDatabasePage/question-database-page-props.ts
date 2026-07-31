import { type QuestionDatabaseRow } from './types';

export interface QuestionDatabasePageProps {
  failed: boolean;
  hidden?: boolean;
  loading: boolean;
  onBack(): void;
  progress: { current: number; total: number };
  rows: QuestionDatabaseRow[];
}
