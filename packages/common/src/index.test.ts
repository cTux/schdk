import { describe, expect, it } from 'vitest';
import {
  createEmptyGamePackage,
  parseGamePackage,
  requiredQuestionKind,
  serializeGamePackage,
  validateGamePackage,
} from './index';

describe('game package rules', () => {
  it('creates and validates the required special questions', () => {
    const gamePackage = createEmptyGamePackage();

    expect(gamePackage.questions).toHaveLength(36);
    expect(requiredQuestionKind(10)).toBe('football');
    expect(
      [11, 23, 35].map((index) => gamePackage.questions[index]?.kind),
    ).toEqual(['music', 'music', 'music']);

    gamePackage.title = 'Тестовий пакет';
    gamePackage.questions.forEach((question) => {
      question.question = 'Питання';
      question.answer = 'Відповідь';
    });
    expect(validateGamePackage(gamePackage)).toEqual([]);

    gamePackage.questions[10]!.kind = 'general';
    expect(validateGamePackage(gamePackage)).toContain(
      'Питання 11: неправильний тип.',
    );
  });

  it('round-trips unfinished packages and rejects malformed files', () => {
    const unfinished = createEmptyGamePackage();
    unfinished.title = 'Чернетка';
    unfinished.questions[0]!.question = 'Незакінчене питання';

    expect(parseGamePackage(serializeGamePackage(unfinished))).toEqual(
      unfinished,
    );
    expect(() => parseGamePackage('{}')).toThrow('Invalid game package');
  });
});
