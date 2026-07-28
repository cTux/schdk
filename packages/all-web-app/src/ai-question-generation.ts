import {
  compareFavoriteItemsByName,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionsPackage,
} from '@schdk/common';
import {
  createGameQuestionPrompt,
  type GameQuestionGenerationRequest,
} from '@schdk/ai';
import { isGlobalAIQuestionAdmin } from '@schdk/google-drive';
import type { AiQuestionGenerationOptions } from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/ui/localization';
import type { AiOptions } from '@schdk/ui/options';
import { useAIQuestions } from './ai-question-storage';
import { useAIQuestionsPackages } from './ai-questions-package-storage';
import type {
  GoogleDriveBridge,
  GoogleDriveConnection,
} from './google-drive-types';
import { useAiSettings } from './use-ai-settings';

export function createAiQuestionGeneration(
  bridge: GoogleDriveBridge | null,
  options: AiOptions,
  templates: AIQuestion[],
  packages: AIQuestionsPackage[],
  locale: AppLocale,
  isAdmin: boolean,
  generalRule?: AIQuestion,
): AiQuestionGenerationOptions {
  function createRequest(
    template: AIQuestion,
    context: string,
    excludedAnswers: string[],
    difficulty: AIQuestionDifficulty = 'medium',
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
      excludedAnswers,
    };
  }

  return {
    apiKeyConfigured: options.apiKeyConfigured,
    packages: packages
      .filter((item) => item.enabled)
      .sort(compareFavoriteItemsByName),
    templates: templates
      .filter((template) => template.enabled && !template.generalRule)
      .sort(compareFavoriteItemsByName),
    onGenerationStart: bridge?.renewToken?.bind(bridge),
    getPromptPreview: isAdmin
      ? (template, context, excludedAnswers = [], difficulty = 'medium') => {
          const { system, prompt } = createGameQuestionPrompt(
            createRequest(template, context, excludedAnswers, difficulty),
          );
          return `${system}\n\n${prompt}`;
        }
      : undefined,
    onGenerate(template, context, excludedAnswers = [], difficulty = 'medium') {
      if (!bridge) {
        return Promise.reject(new Error('Google Drive is disconnected'));
      }
      return bridge.generateAiQuestion(
        createRequest(template, context, excludedAnswers, difficulty),
      );
    },
  };
}

export function useAiQuestionTools(
  bridge: GoogleDriveBridge | null,
  connection: GoogleDriveConnection,
  locale: AppLocale,
) {
  const accountId =
    connection.state === 'connected'
      ? connection.account.emailAddress
      : undefined;
  const aiQuestionCollections = useAIQuestions(bridge, accountId);
  const aiQuestionsPackages = useAIQuestionsPackages(bridge, accountId);
  const aiQuestions = {
    ...aiQuestionCollections.personal,
    globalQuestions: aiQuestionCollections.global.questions,
    globalFailed: aiQuestionCollections.global.failed,
    globalLoading: aiQuestionCollections.global.loading,
    addGlobalQuestion: aiQuestionCollections.global.addQuestion,
    updateGlobalQuestion: aiQuestionCollections.global.updateQuestion,
    removeGlobalQuestion: aiQuestionCollections.global.removeQuestion,
    isGlobalAdmin: isGlobalAIQuestionAdmin(accountId),
  };
  const ai = useAiSettings(
    connection.state === 'connected' ? bridge : null,
    accountId,
  );
  return {
    ai,
    aiQuestions,
    aiQuestionsPackages,
    aiGeneration: createAiQuestionGeneration(
      bridge,
      ai.options,
      [...aiQuestions.questions, ...aiQuestions.globalQuestions],
      aiQuestionsPackages.packages,
      locale,
      isGlobalAIQuestionAdmin(accountId),
      aiQuestions.globalQuestions.find((question) => question.generalRule),
    ),
  };
}
