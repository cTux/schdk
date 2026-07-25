import { createEmptyGamePackage } from '@schdk/common';
import { describe, expect, it } from 'vitest';
import { summarizeGamePackage } from './game-package-summary';

describe('summarizeGamePackage', () => {
  it('returns spoiler-free package counts', () => {
    const gamePackage = createEmptyGamePackage();
    gamePackage.title = 'Кубок Києва';
    gamePackage.questions[0] = {
      type: 'standard',
      questionParts: ['Секретне питання'],
      answer: 'Секретна відповідь',
      alternativeAnswers: [],
      handout: {
        name: 'secret.png',
        mimeType: 'image/png',
        dataUrl: 'data:image/png;base64,secret',
      },
    };

    const summary = summarizeGamePackage(gamePackage);

    expect(summary).toEqual({
      title: 'Кубок Києва',
      roundCount: 3,
      questionCount: 36,
      handoutCount: 1,
    });
    expect(JSON.stringify(summary)).not.toContain('Секретне');
  });
});
