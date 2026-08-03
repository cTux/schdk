import type { GamePackage } from '@schdk/common/game-packages';
import { getNextPosition, getPreviousPosition } from './game-flow';
import type { GamePosition } from './game-position';

type Direction = 'forward' | 'backward';

function getGameWizardMove(
  gamePackage: GamePackage,
  position: GamePosition,
  direction: Direction,
) {
  const target =
    direction === 'forward'
      ? getNextPosition(gamePackage, position)
      : getPreviousPosition(gamePackage, position);
  return {
    target,
    questionChanging:
      !target ||
      target.questionIndex !== position.questionIndex ||
      target.stage === 'tour' ||
      position.stage === 'tour' ||
      target.stage === 'musicBreak' ||
      position.stage === 'musicBreak',
  };
}

export { getGameWizardMove, type Direction };
