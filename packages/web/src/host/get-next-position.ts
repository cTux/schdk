import { QUESTIONS_PER_ROUND, type GamePackage } from '@schdk/common';
import { type GamePosition } from './game-position';
import { getQuestionPositions } from './get-question-positions';
import { getMusicBreak } from './get-music-break';

export function getNextPosition(
  gamePackage: GamePackage,
  position: GamePosition,
): GamePosition | null {
  if (position.stage === 'tour') {
    return {
      ...position,
      stage: 'intro',
    };
  }
  if (position.stage === 'musicBreak') {
    return {
      questionIndex: position.questionIndex + 1,
      questionPartIndex: 0,
      stage: 'tour',
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
  if (positionIndex < positions.length - 1) {
    return {
      questionIndex: position.questionIndex,
      ...positions[positionIndex + 1]!,
    };
  }
  if (getMusicBreak(gamePackage, position.questionIndex)) {
    return {
      questionIndex: position.questionIndex,
      questionPartIndex: 0,
      stage: 'musicBreak',
    };
  }
  if (position.questionIndex >= gamePackage.questions.length - 1) return null;
  const questionIndex = position.questionIndex + 1;
  return {
    questionIndex,
    questionPartIndex: 0,
    stage: questionIndex % QUESTIONS_PER_ROUND === 0 ? 'tour' : 'intro',
  };
}
