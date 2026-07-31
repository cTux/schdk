import type {
  AIQuestion,
  AIQuestionDifficulty,
  AIQuestionRecognizability,
  AIQuestionsPackage,
  GameQuestion,
  SchdkDictionaryItem,
} from '@schdk/common';

export interface AiQuestionGenerationOptions {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  packages: AIQuestionsPackage[];
  difficulties: SchdkDictionaryItem[];
  recognizabilities: SchdkDictionaryItem[];
  onGenerationStart?(): Promise<void>;
  getPromptPreview?(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    recognizability?: AIQuestionRecognizability,
  ): string;
  onGenerate(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    recognizability?: AIQuestionRecognizability,
  ): Promise<GameQuestion>;
  onQuestionGenerationStateChange?(generating: boolean, docked: boolean): void;
  excludedAnswers?: string[];
}
