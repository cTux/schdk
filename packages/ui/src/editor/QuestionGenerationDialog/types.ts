import type {
  AIQuestion,
  AIQuestionDifficulty,
  AIQuestionRecognizability,
  GameQuestion,
  SchdkDictionaryItem,
} from '@schdk/common';
import type { AiQuestionGenerationOptions } from '../types';

export interface QuestionGenerationDialogProps {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  difficulties: SchdkDictionaryItem[];
  recognizabilities: SchdkDictionaryItem[];
  getPromptPreview?(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    recognizability?: AIQuestionRecognizability,
  ): string;
  generateQuestion: AiQuestionGenerationOptions['generateQuestion'];
  excludedAnswers?: string[];
  onGenerated(question: GameQuestion): void;
  onQuestionGenerationStateChange?(generating: boolean, docked: boolean): void;
}
