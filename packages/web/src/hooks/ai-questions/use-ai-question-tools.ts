import type { AppLocale } from '@schdk/common/app-settings';
import { useAIQuestions } from '../../storage/ai-questions/ai-question-storage';
import { useAIQuestionsPackages } from '../../storage/ai-question-packages/ai-questions-package-storage';
import type {
  GoogleDriveBridge,
  GoogleDriveConnection,
} from '../../types/google-drive/google-drive-types';
import { useAiSettings } from './use-ai-settings';
import { createAiQuestionGeneration } from '../../services/ai-questions/ai-question-generation';
import { useDictionaries } from '../dictionaries/use-dictionaries';

export function useAiQuestionTools(
  bridge: GoogleDriveBridge | null,
  connection: GoogleDriveConnection,
  locale: AppLocale,
  enabled: { questions: boolean; packages: boolean; dictionaries: boolean },
) {
  const accountId =
    connection.state === 'connected'
      ? connection.account.emailAddress
      : undefined;
  const canPreviewPrompts = accountId?.toLowerCase() === 'ccctux@gmail.com';
  const aiQuestionCollections = useAIQuestions(
    bridge,
    accountId,
    enabled.questions,
  );
  const aiQuestionsPackages = useAIQuestionsPackages(
    bridge,
    accountId,
    enabled.packages,
  );
  const dictionaries = useDictionaries(
    bridge,
    connection,
    enabled.dictionaries,
  );
  const aiQuestions = {
    ...aiQuestionCollections.personal,
    globalQuestions: aiQuestionCollections.global.questions,
    globalFailed: aiQuestionCollections.global.failed,
    globalLoading: aiQuestionCollections.global.loading,
    addGlobalQuestion: aiQuestionCollections.global.addQuestion,
    updateGlobalQuestion: aiQuestionCollections.global.updateQuestion,
    removeGlobalQuestion: aiQuestionCollections.global.removeQuestion,
    isGlobalAdmin: false,
  };
  const ai = useAiSettings(
    connection.state === 'connected' ? bridge : null,
    accountId,
  );
  return {
    ai,
    aiQuestions,
    aiQuestionsPackages,
    dictionaries,
    aiGeneration: createAiQuestionGeneration(
      bridge,
      ai.options,
      [...aiQuestions.questions, ...aiQuestions.globalQuestions],
      aiQuestionsPackages.packages,
      locale,
      canPreviewPrompts,
      aiQuestions.globalQuestions.find((question) => question.generalRule),
      dictionaries.dictionaries,
    ),
  };
}
