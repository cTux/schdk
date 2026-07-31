import { describe, expect, it, vi } from 'vitest';
import type { GameQuestion } from '@schdk/common';
import type { AiOptions } from '@schdk/ui/options';
import type { GoogleDriveBridge } from '../../types/google-drive/google-drive-types';
import { createAiQuestionGeneration } from './ai-question-generation';

const template = {
  name: 'Rule',
  description: 'Rule description',
  goodExamples: '',
  badExamples: '',
  enabled: true,
  favorite: true,
  generalRule: false,
};

const question = (answer: string): GameQuestion => ({
  type: 'standard',
  questionParts: ['Question'],
  answer,
  alternativeAnswers: [],
  wrongAnswers: [],
});

describe('AI generation controller', () => {
  it('renews once and carries generated answers through a package run', async () => {
    const renewToken = vi.fn();
    const generateAiQuestion = vi
      .fn()
      .mockResolvedValueOnce(question('First'))
      .mockResolvedValueOnce(question('Second'));
    const generation = createAiQuestionGeneration(
      { renewToken, generateAiQuestion } as unknown as GoogleDriveBridge,
      {
        providers: [],
        provider: 'openai',
        model: 'test',
        apiKeyConfigured: true,
      } satisfies AiOptions,
      [template],
      [],
      'uk',
      false,
    );
    const progress = vi.fn();

    await generation.generatePackage(
      {
        steps: [
          { index: 0, template, context: 'One' },
          { index: 1, template, context: 'Two' },
        ],
        excludedAnswers: ['Existing'],
        difficultyDistribution: {
          'very-easy': 0,
          easy: 0,
          medium: 100,
          hard: 0,
          'very-hard': 0,
        },
        recognizabilityDistribution: {
          'very-easy': 0,
          easy: 100,
          medium: 0,
          hard: 0,
          'very-hard': 0,
        },
      },
      progress,
    );

    expect(renewToken).toHaveBeenCalledOnce();
    expect(generateAiQuestion).toHaveBeenCalledTimes(2);
    expect(generateAiQuestion.mock.calls[1]?.[0].excludedAnswers).toEqual([
      'Existing',
      'First',
    ]);
    expect(progress).toHaveBeenLastCalledWith(
      expect.objectContaining({ index: 1, position: 2, total: 2 }),
    );
  });
});
