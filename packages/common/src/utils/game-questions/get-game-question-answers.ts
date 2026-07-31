import { type GameQuestion } from '../../contracts/game-questions/game-question.js';

export function getGameQuestionAnswers(
  question: Pick<GameQuestion, 'answer' | 'alternativeAnswers'>,
) {
  return [question.answer, ...question.alternativeAnswers].filter((answer) =>
    answer.trim(),
  );
}
