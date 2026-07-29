import type { QuestionDatabaseRow } from '../QuestionDatabasePage';
import { type QuestionDatabaseSort } from './types';

export interface QuestionDatabaseTableProps {
  ascending: boolean;
  rows: QuestionDatabaseRow[];
  sort: QuestionDatabaseSort;
  onSelect?(row: QuestionDatabaseRow): void;
  onSort(sort: QuestionDatabaseSort): void;
}
