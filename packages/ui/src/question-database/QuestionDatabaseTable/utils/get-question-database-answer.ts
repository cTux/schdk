import type { QuestionDatabaseRow } from '../../question-database-row';

export function getQuestionDatabaseAnswer(row: QuestionDatabaseRow) {
  return [row.answer, ...row.alternativeAnswers].join(' · ');
}
