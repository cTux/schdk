import type { QuestionDatabaseRow } from '../QuestionDatabasePage';

export type QuestionDatabaseSort = 'question' | 'answer';

export interface QuestionDatabaseTableProps {
  ascending: boolean;
  rows: QuestionDatabaseRow[];
  sort: QuestionDatabaseSort;
  onSelect?(row: QuestionDatabaseRow): void;
  onSort(sort: QuestionDatabaseSort): void;
}
