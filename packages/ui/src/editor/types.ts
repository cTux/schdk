import { type RecentPackageItem } from '../game-packages';
import {
  type AiPackageGenerationProgress,
  type AiPackageGenerationRequest,
  type AiQuestionGenerationOptions,
  type AiQuestionGenerationRequest,
} from './ai-question-generation-options';
import { type EditorViewProps } from './editor-view-props';

type EditorSaveStatus = 'saved' | 'pending' | 'saving' | 'error';

export {
  type EditorSaveStatus,
  type RecentPackageItem,
  type AiQuestionGenerationOptions,
  type AiQuestionGenerationRequest,
  type AiPackageGenerationRequest,
  type AiPackageGenerationProgress,
  type EditorViewProps,
};
