import { type GameQuestion } from './game-question.js';

export function getGameQuestionAnswers(
  question: Pick<GameQuestion, 'answer' | 'alternativeAnswers'>,
) {
  return [question.answer, ...question.alternativeAnswers].filter((answer) =>
    answer.trim(),
  );
}
