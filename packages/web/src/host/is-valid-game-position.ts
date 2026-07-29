import { type GamePackage } from '@schdk/common';
import { type GamePosition } from './game-position';
import { getMusicBreak } from './get-music-break';
import { getQuestionPositions } from './get-question-positions';

export function isValidGamePosition(
  gamePackage: GamePackage,
  position: GamePosition,
) {
  if (position.stage === 'musicBreak') {
    return (
      position.questionPartIndex === 0 &&
      Boolean(getMusicBreak(gamePackage, position.questionIndex))
    );
  }
  const question = gamePackage.questions[position.questionIndex];
  if (!question) return false;
  return getQuestionPositions(question).some(
    ({ questionPartIndex, stage }) =>
      questionPartIndex === position.questionPartIndex &&
      stage === position.stage,
  );
}
