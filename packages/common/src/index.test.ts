import { describe, expect, it } from 'vitest';
import {
  createEmptyGamePackage,
  parseGamePackage,
  serializeGamePackage,
  validateGamePackage,
} from './index';

describe('game package rules', () => {
  it('treats questions with unresolved comments as unfinished', () => {
    const gamePackage = createEmptyGamePackage();

    expect(gamePackage.questions).toHaveLength(36);

    gamePackage.title = 'Тестовий пакет';
    gamePackage.questions.forEach((question) => {
      question.question = 'Питання';
      question.answer = 'Відповідь';
    });
    expect(validateGamePackage(gamePackage)).toEqual([]);

    gamePackage.questions[10]!.comment = 'Уточнити формулювання';
    expect(validateGamePackage(gamePackage)).toContain(
      'Питання 11: є невирішений коментар.',
    );
    delete gamePackage.questions[10]!.comment;
    expect(validateGamePackage(gamePackage)).toEqual([]);
  });

  it('round-trips unfinished packages and rejects malformed files', () => {
    const unfinished = createEmptyGamePackage();
    unfinished.title = 'Чернетка';
    unfinished.questions[0]!.question = 'Незакінчене питання';
    unfinished.questions[0]!.comment = 'Перевірити джерело';
    unfinished.questions[0]!.hostNotes = 'Показати роздатку після сигналу';

    const content = serializeGamePackage(unfinished);
    expect(content).not.toContain('"kind"');
    expect(parseGamePackage(content)).toEqual(unfinished);
    expect(() => parseGamePackage('{}')).toThrow('Invalid game package');
  });

  it('removes deleted handouts from serialized packages', () => {
    const gamePackage = createEmptyGamePackage();
    gamePackage.questions[0]!.handout = {
      name: 'handout.png',
      mimeType: 'image/png',
      dataUrl: 'data:image/png;base64,dGVzdA==',
    };

    const withHandout = serializeGamePackage(gamePackage);
    delete gamePackage.questions[0]!.handout;
    const withoutHandout = serializeGamePackage(gamePackage);

    expect(withoutHandout).not.toEqual(withHandout);
    expect(withoutHandout).not.toContain('handout.png');
  });
});
