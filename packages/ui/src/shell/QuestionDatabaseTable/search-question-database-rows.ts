import type { QuestionDatabaseRow } from '../QuestionDatabasePage';
import { type QuestionDatabaseSearchField } from './question-database-search-field';
import { getQuestionDatabaseAnswer } from './get-question-database-answer';

function normalize(value: string) {
  return value.normalize('NFKC').toLocaleLowerCase().trim();
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
