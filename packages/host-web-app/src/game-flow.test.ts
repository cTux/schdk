import { createEmptyGamePackage } from '@schdk/common';
import { describe, expect, it } from 'vitest';
import {
  getNextPosition,
  getPreviousPosition,
  getQuestionStages,
  getVisibleQuestionStages,
} from './game-flow';

describe('game question flow', () => {
  it('skips absent optional stages and keeps revealed stages visible', () => {
    const gamePackage = createEmptyGamePackage();
    const question = gamePackage.questions[0]!;
    question.questionParts = ['Question'];
    question.answer = 'Answer';

    expect(getQuestionStages(question)).toEqual([
      'intro',
      'question',
      'timer',
      'answer',
    ]);
    expect(getVisibleQuestionStages(question, 'answer')).toEqual([
      'question',
      'timer',
      'answer',
    ]);
  });

  it('includes handout and answer-comment stages when present', () => {
    const question = createEmptyGamePackage().questions[0]!;
    question.handout = {
      name: 'handout.png',
      mimeType: 'image/png',
      dataUrl: 'data:image/png;base64,AA==',
    };
    question.answerComment = 'Comment';

    expect(getQuestionStages(question)).toEqual([
      'intro',
      'handout',
      'question',
      'timer',
      'answerComment',
      'answer',
    ]);
  });

  it('moves across question boundaries in both directions', () => {
    const gamePackage = createEmptyGamePackage();

    expect(
      getNextPosition(gamePackage, {
        questionIndex: 0,
        questionPartIndex: 0,
        stage: 'answer',
      }),
    ).toEqual({ questionIndex: 1, questionPartIndex: 0, stage: 'intro' });
    expect(
      getPreviousPosition(gamePackage, {
        questionIndex: 1,
        questionPartIndex: 0,
        stage: 'intro',
      }),
    ).toEqual({ questionIndex: 0, questionPartIndex: 0, stage: 'answer' });
    expect(
      getPreviousPosition(gamePackage, {
        questionIndex: 0,
        questionPartIndex: 0,
        stage: 'intro',
      }),
    ).toBeNull();
    expect(
      getNextPosition(gamePackage, {
        questionIndex: 35,
        questionPartIndex: 0,
        stage: 'answer',
      }),
    ).toBeNull();
  });
});
