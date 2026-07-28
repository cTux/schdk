import type { QuestionDatabaseRow } from '../QuestionDatabasePage';
import type { QuestionDatabaseSort } from './types';

export const QUESTION_DATABASE_ROW_HEIGHT = 76;
export type QuestionDatabaseSearchField = 'all' | 'question' | 'answer';

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim();
}

export function getQuestionDatabaseAnswer(row: QuestionDatabaseRow) {
  return [row.answer, ...row.alternativeAnswers].join(' · ');
}

export function searchQuestionDatabaseRows(
  rows: QuestionDatabaseRow[],
  query: string,
  field: QuestionDatabaseSearchField = 'all',
) {
  const needle = normalize(query);
  if (needle.length < 2) return [...rows];
  return rows.filter((row) => {
    const question = normalize(row.question);
    const answer = normalize(getQuestionDatabaseAnswer(row));
    return field === 'question'
      ? question.includes(needle)
      : field === 'answer'
        ? answer.includes(needle)
        : question.includes(needle) || answer.includes(needle);
  });
}

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
