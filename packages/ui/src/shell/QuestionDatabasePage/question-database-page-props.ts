import { type QuestionDatabaseRow } from './types';

export interface QuestionDatabasePageProps {
  failed: boolean;
  hidden?: boolean;
  loading: boolean;
  progress: { current: number; total: number };
  rows: QuestionDatabaseRow[];
}
