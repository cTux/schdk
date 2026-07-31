import type { QuestionDatabaseRow } from '../../QuestionDatabasePage';
import type { QuestionDatabaseSort } from '../types';
import { getQuestionDatabaseAnswer } from './get-question-database-answer';

export function sortQuestionDatabaseRows(
  rows: QuestionDatabaseRow[],
  sort: QuestionDatabaseSort,
  ascending: boolean,
  locale: string,
) {
  return [...rows].sort((left, right) => {
    const comparison =
      sort === 'question'
        ? left.question.localeCompare(right.question, locale)
        : getQuestionDatabaseAnswer(left).localeCompare(
            getQuestionDatabaseAnswer(right),
            locale,
          );
    return ascending ? comparison : -comparison;
  });
}
