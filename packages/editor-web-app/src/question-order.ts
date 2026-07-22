import type { GameQuestion } from '@schdk/common';

export function swapQuestions(
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

export function getSelectedIndexAfterSwap(
  selectedIndex: number,
  sourceIndex: number,
  targetIndex: number,
) {
  if (selectedIndex === sourceIndex) return targetIndex;
  if (selectedIndex === targetIndex) return sourceIndex;
  return selectedIndex;
}
