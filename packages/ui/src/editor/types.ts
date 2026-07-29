import { type RecentPackageItem } from './recent-package-item';
import { type AiQuestionGenerationOptions } from './ai-question-generation-options';
import { type EditorViewProps } from './editor-view-props';

type EditorSaveStatus = 'saved' | 'pending' | 'saving' | 'error';

export {
  type EditorSaveStatus,
  type RecentPackageItem,
  type AiQuestionGenerationOptions,
  type EditorViewProps,
};
