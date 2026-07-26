import type { AIQuestion } from '@schdk/common';
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
): AiQuestionGenerationOptions {
  return {
    apiKeyConfigured: options.apiKeyConfigured,
    templates: templates
      .filter(({ enabled }) => enabled)
      .sort((left, right) => Number(right.favorite) - Number(left.favorite)),
    onGenerate(template, context) {
      if (!bridge) {
        return Promise.reject(new Error('Google Drive is disconnected'));
      }
      return bridge.generateAiQuestion({
        provider: options.provider,
        model: options.model,
        locale,
        template,
        context,
      });
    },
  };
}

export function useAiQuestionTools(
  storage: Storage,
  bridge: GoogleDriveBridge | null,
  connection: GoogleDriveConnection,
  locale: AppLocale,
) {
  const aiQuestions = useAIQuestions(storage);
  const ai = useAiSettings(
    connection.state === 'connected' ? bridge : null,
    connection.state === 'connected'
      ? connection.account.emailAddress
      : undefined,
  );
  return {
    ai,
    aiQuestions,
    aiGeneration: createAiQuestionGeneration(
      bridge,
      ai.options,
      aiQuestions.questions,
      locale,
    ),
  };
}
