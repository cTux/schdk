import {
  compareFavoriteItemsByName,
  type AIQuestion,
  type AIQuestionDifficulty,
  type AIQuestionRecognizability,
  type AIQuestionsPackage,
  DEFAULT_SCHDK_DICTIONARIES,
  type SchdkDictionary,
} from '@schdk/common';
import {
  createGameQuestionPrompt,
  type GameQuestionGenerationRequest,
} from '@schdk/ai';
import type { AiQuestionGenerationOptions } from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/ui/localization';
import type { AiOptions } from '@schdk/ui/options';
import type { GoogleDriveBridge } from './google-drive-types';
import { type QuestionDatabaseAccess } from './question-database-access';
import { useAiQuestionTools } from './use-ai-question-tools';

function createAiQuestionGeneration(
  bridge: GoogleDriveBridge | null,
  options: AiOptions,
  templates: AIQuestion[],
  packages: AIQuestionsPackage[],
  locale: AppLocale,
  isAdmin: boolean,
  questionDatabase: QuestionDatabaseAccess,
  generalRule?: AIQuestion,
  dictionaries: SchdkDictionary[] = [...DEFAULT_SCHDK_DICTIONARIES],
): AiQuestionGenerationOptions {
  const difficultyDictionary =
    dictionaries.find(({ id }) => id === 'question-difficulty') ??
    DEFAULT_SCHDK_DICTIONARIES[0];
  const recognizabilityDictionary =
    dictionaries.find(({ id }) => id === 'question-recognizability') ??
    DEFAULT_SCHDK_DICTIONARIES[1];

  function createRequest(
    template: AIQuestion,
    context: string,
    excludedAnswers: string[],
    difficulty: AIQuestionDifficulty = 'medium',
    checkQuestionDatabase = false,
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
    difficulties: difficultyDictionary.items,
    recognizabilities: recognizabilityDictionary.items,
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
              false,
              recognizability,
            ),
          );
          return `${system}\n\n${prompt}`;
        }
      : undefined,
    async onGenerate(
      template,
      context,
      excludedAnswers = [],
      difficulty = 'medium',
      checkQuestionDatabase = false,
      recognizability = 'easy',
    ) {
      if (!bridge) {
        throw new Error('Google Drive is disconnected');
      }
      const question = await bridge.generateAiQuestion(
        createRequest(
          template,
          context,
          excludedAnswers,
          difficulty,
          checkQuestionDatabase,
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
    },
  };
}

export { createAiQuestionGeneration, useAiQuestionTools };
