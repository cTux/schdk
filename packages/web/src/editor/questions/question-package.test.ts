import { createEmptyGamePackage } from '@schdk/common';
import { describe, expect, it } from 'vitest';
import {
  isGameQuestionEmpty,
  replaceGamePackageQuestion,
  updateGamePackageQuestion,
} from './question-package';

describe('question package changes', () => {
  it('updates and replaces one question without mutating the package', () => {
    const gamePackage = createEmptyGamePackage();
    const updated = updateGamePackageQuestion(gamePackage, 1, {
      answer: 'Updated',
    });
    const replaced = replaceGamePackageQuestion(
      updated,
      2,
      updated.questions[1]!,
    );

    expect(isGameQuestionEmpty(gamePackage.questions[1]!)).toBe(true);
    expect(updated.questions[1]?.answer).toBe('Updated');
    expect(replaced.questions[2]?.answer).toBe('Updated');
    expect(gamePackage.questions[1]?.answer).toBe('');
  });
});
