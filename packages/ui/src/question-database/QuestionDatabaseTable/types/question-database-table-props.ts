import type { QuestionDatabaseRow } from '../../question-database-row';
import { type QuestionDatabaseSort } from '../types';

export interface QuestionDatabaseTableProps {
  ascending: boolean;
  rows: QuestionDatabaseRow[];
  sort: QuestionDatabaseSort;
  onSelect?(row: QuestionDatabaseRow): void;
  onSort(sort: QuestionDatabaseSort): void;
}
