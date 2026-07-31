import {
  compareFavoriteItemsByName,
  AI_QUESTION_DIFFICULTIES,
  getGameQuestionAnswers,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
  type AIQuestionsPackage,
  DEFAULT_SCHDK_DICTIONARIES,
  type SchdkDictionary,
  type SchdkDictionaryDistribution,
} from '@schdk/common';
import {
  createGameQuestionPrompt,
  type GameQuestionGenerationRequest,
} from '@schdk/ai';
import type {
  AiQuestionGenerationOptions,
  AiQuestionGenerationRequest,
} from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/ui/localization';
import type { AiOptions } from '@schdk/ui/options';
import type { GoogleDriveBridge } from '../../types/google-drive/google-drive-types';
import { useAiQuestionTools } from '../../hooks/ai-questions/use-ai-question-tools';

function getRandomValue(distribution: SchdkDictionaryDistribution) {
  let position = Math.random() * 100;
  return (
    AI_QUESTION_DIFFICULTIES.find(
      (difficulty) => (position -= distribution[difficulty]) < 0,
    ) ?? 'medium'
  );
}

function createAiQuestionGeneration(
  bridge: GoogleDriveBridge | null,
  options: AiOptions,
  templates: AIQuestion[],
  packages: AIQuestionsPackage[],
  locale: AppLocale,
  isAdmin: boolean,
  generalRule?: AIQuestion,
  dictionaries: SchdkDictionary[] = [...DEFAULT_SCHDK_DICTIONARIES],
): AiQuestionGenerationOptions {
  const difficultyDictionary =
    dictionaries.find(({ id }) => id === 'question-difficulty') ??
    DEFAULT_SCHDK_DICTIONARIES[0];
  const recognizabilityDictionary =
    dictionaries.find(({ id }) => id === 'question-recognizability') ??
    DEFAULT_SCHDK_DICTIONARIES[1];
  const difficultyDistributionDictionary =
    dictionaries.find(({ id }) => id === 'question-difficulty-distribution') ??
    DEFAULT_SCHDK_DICTIONARIES[2];
  const recognizabilityDistributionDictionary =
    dictionaries.find(
      ({ id }) => id === 'question-recognizability-distribution',
    ) ?? DEFAULT_SCHDK_DICTIONARIES[3];

  function createRequest(
    template: AIQuestion,
    context: string,
    excludedAnswers: string[],
    difficulty: AIQuestionDifficulty = 'medium',
    recognizability: AIQuestionRecognizability = 'easy',
  ): GameQuestionGenerationRequest {
    return {
      provider: options.provider,
      model: options.model,
      locale,
      template: generalRule
        ? {
            ...template,
            description: `${generalRule.description}\n\n${template.description}`,
            goodExamples: [generalRule.goodExamples, template.goodExamples]
              .filter(Boolean)
              .join('\n\n'),
            badExamples: [generalRule.badExamples, template.badExamples]
              .filter(Boolean)
              .join('\n\n'),
          }
        : template,
      context,
      difficulty,
      difficultyPrompt:
        difficultyDictionary.items.find(({ value }) => value === difficulty)
          ?.promptPart ?? '',
      recognizability,
      recognizabilityPrompt:
        recognizabilityDictionary.items.find(
          ({ value }) => value === recognizability,
        )?.promptPart ?? '',
      excludedAnswers,
    };
  }

  async function generateQuestion({
    template,
    context,
    excludedAnswers = [],
    difficulty = 'medium',
    recognizability = 'easy',
  }: AiQuestionGenerationRequest) {
    if (!bridge) {
      throw new Error('Google Drive is disconnected');
    }
    const question = await bridge.generateAiQuestion(
      createRequest(
        template,
        context,
        excludedAnswers,
        difficulty,
        recognizability,
      ),
    );
    return {
      ...question,
      aiGeneration: {
        rule: template.name,
        difficulty,
        recognizability,
      },
    };
  }

  return {
    apiKeyConfigured: options.apiKeyConfigured,
    difficulties: difficultyDictionary.items,
    recognizabilities: recognizabilityDictionary.items,
    difficultyDistributions: difficultyDistributionDictionary.items,
    recognizabilityDistributions: recognizabilityDistributionDictionary.items,
    packages: packages
      .filter((item) => item.enabled)
      .sort(compareFavoriteItemsByName),
    templates: templates
      .filter((template) => template.enabled && !template.generalRule)
      .sort(compareFavoriteItemsByName),
    getPromptPreview: isAdmin
      ? (
          template,
          context,
          excludedAnswers = [],
          difficulty = 'medium',
          recognizability = 'easy',
        ) => {
          const { system, prompt } = createGameQuestionPrompt(
            createRequest(
              template,
              context,
              excludedAnswers,
              difficulty,
              recognizability,
            ),
          );
          return `${system}\n\n${prompt}`;
        }
      : undefined,
    async generateQuestion(request) {
      await bridge?.renewToken?.();
      return generateQuestion(request);
    },
    async generatePackage(request, onProgress, shouldContinue = () => true) {
      await bridge?.renewToken?.();
      const usedAnswers = [...request.excludedAnswers];
      for (const [position, step] of request.steps.entries()) {
        if (!shouldContinue()) return;
        const generationRequest = {
          ...step,
          excludedAnswers: [...usedAnswers],
          difficulty: getRandomValue(request.difficultyDistribution),
          recognizability: getRandomValue(request.recognizabilityDistribution),
        };
        const question = await generateQuestion(generationRequest);
        if (!shouldContinue()) return;
        onProgress({
          index: step.index,
          position: position + 1,
          total: request.steps.length,
          question,
          request: generationRequest,
        });
        usedAnswers.push(...getGameQuestionAnswers(question));
      }
    },
  };
}

export { createAiQuestionGeneration, useAiQuestionTools };
