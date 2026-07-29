import { type GamePackage } from '@schdk/common';
import { type GamePosition } from './game-position';
import { getQuestionPositions } from './get-question-positions';
import { getMusicBreak } from './get-music-break';

export function getPreviousPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  if (position.stage === 'musicBreak') {
    const positions = getQuestionPositions(
      gamePackage.questions[position.questionIndex]!,
    );
    return {
      questionIndex: position.questionIndex,
      ...positions[positions.length - 1]!,
    };
  }
  const positions = getQuestionPositions(
    gamePackage.questions[position.questionIndex]!,
  );
  const positionIndex = positions.findIndex(
    ({ questionPartIndex, stage }) =>
      questionPartIndex === position.questionPartIndex &&
      stage === position.stage,
  );
  if (positionIndex > 0) {
    return {
      questionIndex: position.questionIndex,
      ...positions[positionIndex - 1]!,
    };
  }
  if (position.questionIndex === 0) return null;
  const previousQuestionIndex = position.questionIndex - 1;
  if (getMusicBreak(gamePackage, previousQuestionIndex)) {
    return {
      questionIndex: previousQuestionIndex,
      questionPartIndex: 0,
      stage: 'musicBreak',
    };
  }
  const previousPositions = getQuestionPositions(
    gamePackage.questions[previousQuestionIndex]!,
  );
  return {
    questionIndex: previousQuestionIndex,
    ...previousPositions[previousPositions.length - 1]!,
  };
}
