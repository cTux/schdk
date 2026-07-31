import type { SchdkDictionaryItem } from '@schdk/common';

export function createDictionaryItem(
  isDistribution: boolean,
): SchdkDictionaryItem {
  return {
    id: `custom-${Date.now()}`,
    value: 'medium',
    name: '',
    description: '',
    promptPart: '',
    ...(isDistribution
      ? {
          distribution: {
            'very-easy': 0,
            easy: 0,
            medium: 100,
            hard: 0,
            'very-hard': 0,
          },
        }
      : {}),
  };
}
