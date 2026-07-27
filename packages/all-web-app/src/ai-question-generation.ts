import type { AIQuestion } from '@schdk/common';
import { isGlobalAIQuestionAdmin } from '@schdk/google-drive';
import type { AiQuestionGenerationOptions } from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/ui/localization';
import type { AiOptions } from '@schdk/ui/options';
import { useAIQuestions } from './ai-question-storage';
import type {
  GoogleDriveBridge,
  GoogleDriveConnection,
} from './google-drive-types';
import { useAiSettings } from './use-ai-settings';

export function createAiQuestionGeneration(
  bridge: GoogleDriveBridge | null,
  options: AiOptions,
  templates: AIQuestion[],
  locale: AppLocale,
  generalRule?: AIQuestion,
): AiQuestionGenerationOptions {
  return {
    apiKeyConfigured: options.apiKeyConfigured,
    templates: templates
      .filter((template) => !template.generalRule)
      .sort(
        (left, right) =>
          Number(right.favorite) - Number(left.favorite) ||
          left.name.localeCompare(right.name),
      ),
    onGenerate(template, context) {
      if (!bridge) {
        return Promise.reject(new Error('Google Drive is disconnected'));
      }
      return bridge.generateAiQuestion({
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
      });
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
    aiGeneration: createAiQuestionGeneration(
      bridge,
      ai.options,
      [...aiQuestions.questions, ...aiQuestions.globalQuestions],
      locale,
      aiQuestions.globalQuestions.find((question) => question.generalRule),
    ),
  };
}
