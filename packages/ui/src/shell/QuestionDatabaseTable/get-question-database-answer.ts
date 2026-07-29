import type { QuestionDatabaseRow } from '../QuestionDatabasePage';

export function getQuestionDatabaseAnswer(row: QuestionDatabaseRow) {
  return [row.answer, ...row.alternativeAnswers].join(' · ');
}
