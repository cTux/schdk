import type { GameQuestion } from '@schdk/common/game-question';
import type { HostQuestionStage } from '@schdk/common/game-hosting';
import { getQuestionPositions } from './get-question-positions';
import { type GamePosition } from './game-position';
import { getVisibleQuestionStages } from './get-visible-question-stages';
import { isValidGamePosition } from './is-valid-game-position';
import { getNextPosition } from './get-next-position';
import { getPreviousPosition } from './get-previous-position';

function getQuestionStages(question: GameQuestion): HostQuestionStage[] {
  return getQuestionPositions(question).map(({ stage }) => stage);
}

export {
  type GamePosition,
  getQuestionStages,
  getVisibleQuestionStages,
  isValidGamePosition,
  getNextPosition,
  getPreviousPosition,
};
