import { QUESTIONS_PER_ROUND, type GamePackage } from '@schdk/common';

export function getMusicBreak(gamePackage: GamePackage, questionIndex: number) {
  const questionNumber = questionIndex + 1;
  if (
    questionNumber % QUESTIONS_PER_ROUND !== 0 ||
    questionNumber === gamePackage.questions.length
  ) {
    return null;
  }
  return gamePackage.musicBreaks[questionNumber / QUESTIONS_PER_ROUND - 1];
}
