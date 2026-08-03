import type { GameQuestion } from '@schdk/common/game-question';
import { getSelectedIndexAfterSwap } from './get-selected-index-after-swap';

function swapQuestions(
  questions: readonly GameQuestion[],
  sourceIndex: number,
  targetIndex: number,
): GameQuestion[] {
  if (sourceIndex === targetIndex) return [...questions];

  const swapped = [...questions];
  [swapped[sourceIndex], swapped[targetIndex]] = [
    swapped[targetIndex]!,
    swapped[sourceIndex]!,
  ];
  return swapped;
}

export { swapQuestions, getSelectedIndexAfterSwap };
