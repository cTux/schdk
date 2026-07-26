import { describe, expect, it } from 'vitest';
import {
  createEmptyGamePackage,
  parseGameQuestion,
  parseGamePackage,
  serializeGamePackage,
  validateGamePackage,
} from './index';

describe('game package rules', () => {
  it('treats questions with unresolved comments as unfinished', () => {
    const gamePackage = createEmptyGamePackage();

    expect(gamePackage.title).toBe('Без назви');
    expect(gamePackage.questions).toHaveLength(36);
    expect(gamePackage.musicBreaks).toEqual([null, null]);

    gamePackage.title = 'Тестовий пакет';
    gamePackage.questions.forEach((question) => {
      question.questionParts = ['Питання'];
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
    unfinished.questions[0]!.questionParts = ['Незакінчене питання'];
    unfinished.questions[0]!.answerComment = 'Пояснення після відповіді';
    unfinished.questions[0]!.comment = 'Перевірити джерело';
    unfinished.questions[0]!.hostNotes = 'Показати роздатку після сигналу';

    const content = serializeGamePackage(unfinished);
    expect(content.slice(0, 2)).toEqual(Uint8Array.from([0x50, 0x4b]));
    expect(parseGamePackage(content)).toEqual(unfinished);
    expect(parseGamePackage(JSON.stringify(unfinished))).toEqual(unfinished);
    expect(() => parseGamePackage('{}')).toThrow('Invalid game package');

    const malformed = structuredClone(unfinished) as unknown as {
      questions: Array<{ answerComment: unknown }>;
    };
    malformed.questions[0]!.answerComment = 42;
    expect(() => parseGamePackage(JSON.stringify(malformed))).toThrow(
      'Invalid game package',
    );
  });

  it('removes deleted handouts from serialized packages', () => {
    const gamePackage = createEmptyGamePackage();
    gamePackage.questions[0]!.handout = {
      name: 'handout.png',
      mimeType: 'image/png',
      dataUrl: `data:image/png;base64,${'A'.repeat(10_000)}`,
    };

    const uncompressedLength = JSON.stringify(gamePackage).length;
    const withHandout = serializeGamePackage(gamePackage);
    delete gamePackage.questions[0]!.handout;
    const withoutHandout = serializeGamePackage(gamePackage);

    expect(withoutHandout).not.toEqual(withHandout);
    expect(
      parseGamePackage(withoutHandout).questions[0]!.handout,
    ).toBeUndefined();
    expect(withHandout.byteLength).toBeLessThan(uncompressedLength);
  });

  it('stores music breaks as uncompressed package files', () => {
    const gamePackage = createEmptyGamePackage();
    gamePackage.musicBreaks[0] = {
      name: 'pause.mp3',
      mimeType: 'audio/mpeg',
      data: Uint8Array.from([1, 2, 3, 4]),
    };

    expect(parseGamePackage(serializeGamePackage(gamePackage))).toEqual(
      gamePackage,
    );

    gamePackage.musicBreaks[0] = null;
    expect(
      parseGamePackage(serializeGamePackage(gamePackage)).musicBreaks,
    ).toEqual([null, null]);
  });

  it('parses clipboard questions with every supported field', () => {
    const question = {
      type: 'standard' as const,
      questionParts: ['Питання'],
      answer: 'Відповідь',
      answerComment: 'Коментар до відповіді',
      alternativeAnswers: ['Альтернатива'],
      wrongAnswers: ['Неправильна'],
      handout: {
        name: 'handout.png',
        mimeType: 'image/png',
        dataUrl: 'data:image/png;base64,AA==',
      },
      comment: 'Зауваження',
      hostNotes: 'Примітки для ведучого',
    };

    expect(parseGameQuestion(JSON.parse(JSON.stringify(question)))).toEqual(
      question,
    );
    expect(() =>
      parseGameQuestion({
        ...question,
        handout: { ...question.handout, dataUrl: 'https://example.com/pixel' },
      }),
    ).toThrow('Invalid game question');
    expect(() =>
      parseGameQuestion({
        ...question,
        handout: {
          ...question.handout,
          mimeType: 'image/jpeg',
        },
      }),
    ).toThrow('Invalid game question');
    expect(() => parseGameQuestion({ ...question, hostNotes: 42 })).toThrow(
      'Invalid game question',
    );
  });
});
