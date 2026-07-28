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
import {
  isGlobalAIQuestionAdmin,
  type QuestionDatabaseEntry,
} from '@schdk/google-drive';
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

interface QuestionDatabaseAccess {
  getEntries(): QuestionDatabaseEntry[];
  refresh(): Promise<QuestionDatabaseEntry[]>;
}

export function createAiQuestionGeneration(
  bridge: GoogleDriveBridge | null,
  options: AiOptions,
  templates: AIQuestion[],
  packages: AIQuestionsPackage[],
  locale: AppLocale,
  isAdmin: boolean,
  questionDatabase: QuestionDatabaseAccess,
  generalRule?: AIQuestion,
): AiQuestionGenerationOptions {
  function createRequest(
    template: AIQuestion,
    context: string,
    excludedAnswers: string[],
    difficulty: AIQuestionDifficulty = 'medium',
    checkQuestionDatabase = false,
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
      existingQuestions: checkQuestionDatabase
        ? questionDatabase.getEntries().map((question) => ({
            question: question.question,
            answers: [question.answer, ...question.alternativeAnswers],
          }))
        : [],
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
    async onGenerationStart(checkQuestionDatabase = false) {
      await bridge?.renewToken?.();
      if (checkQuestionDatabase) await questionDatabase.refresh();
    },
    getPromptPreview: isAdmin
      ? (template, context, excludedAnswers = [], difficulty = 'medium') => {
          const { system, prompt } = createGameQuestionPrompt(
            createRequest(template, context, excludedAnswers, difficulty),
          );
          return `${system}\n\n${prompt}`;
        }
      : undefined,
    onGenerate(
      template,
      context,
      excludedAnswers = [],
      difficulty = 'medium',
      checkQuestionDatabase = false,
    ) {
      if (!bridge) {
        return Promise.reject(new Error('Google Drive is disconnected'));
      }
      return bridge.generateAiQuestion(
        createRequest(
          template,
          context,
          excludedAnswers,
          difficulty,
          checkQuestionDatabase,
        ),
      );
    },
  };
}

export function useAiQuestionTools(
  bridge: GoogleDriveBridge | null,
  connection: GoogleDriveConnection,
  locale: AppLocale,
  questionDatabase: QuestionDatabaseAccess,
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
      questionDatabase,
      aiQuestions.globalQuestions.find((question) => question.generalRule),
    ),
  };
}
