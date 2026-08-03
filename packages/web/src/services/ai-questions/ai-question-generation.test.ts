import { describe, expect, it, vi } from 'vitest';
import type { GameQuestion } from '@schdk/common/game-question';
import type { AiOptions } from '@schdk/common/app-settings';
import type { AiGenerationPort } from '../../types/google-drive/google-drive-types';
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
      { renewToken, generateAiQuestion } satisfies AiGenerationPort,
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

  it('forwards cancellation and stops before the next package target', async () => {
    const controller = new AbortController();
    const generateAiQuestion = vi.fn(async (_request, signal) => {
      expect(signal).toBe(controller.signal);
      controller.abort();
      return question('First');
    });
    const generation = createAiQuestionGeneration(
      {
        renewToken: vi.fn(),
        generateAiQuestion,
      } satisfies AiGenerationPort,
      {
        providers: [],
        provider: 'openai',
        model: 'test',
        apiKeyConfigured: true,
      },
      [template],
      [],
      'uk',
      false,
    );

    await expect(
      generation.generatePackage(
        {
          steps: [
            { index: 0, template, context: 'One' },
            { index: 1, template, context: 'Two' },
          ],
          excludedAnswers: [],
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
        vi.fn(),
        controller.signal,
      ),
    ).rejects.toMatchObject({ name: 'AbortError' });
    expect(generateAiQuestion).toHaveBeenCalledOnce();
  });
});
