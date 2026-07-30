import { isGlobalAIQuestionAdmin } from '@schdk/google-drive';
import type { AppLocale } from '@schdk/ui/localization';
import { useAIQuestions } from './ai-question-storage';
import { useAIQuestionsPackages } from './ai-questions-package-storage';
import type {
  GoogleDriveBridge,
  GoogleDriveConnection,
} from './google-drive-types';
import { useAiSettings } from './use-ai-settings';
import { type QuestionDatabaseAccess } from './question-database-access';
import { createAiQuestionGeneration } from './ai-question-generation';
import { useDictionaries } from './use-dictionaries';

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
  const dictionaries = useDictionaries(bridge, connection);
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
    dictionaries,
    aiGeneration: createAiQuestionGeneration(
      bridge,
      ai.options,
      [...aiQuestions.questions, ...aiQuestions.globalQuestions],
      aiQuestionsPackages.packages,
      locale,
      isGlobalAIQuestionAdmin(accountId),
      questionDatabase,
      aiQuestions.globalQuestions.find((question) => question.generalRule),
      dictionaries.dictionaries,
    ),
  };
}
