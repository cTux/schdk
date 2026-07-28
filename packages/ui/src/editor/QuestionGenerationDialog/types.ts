import type {
  AIQuestion,
  AIQuestionDifficulty,
  GameQuestion,
} from '@schdk/common';

export interface QuestionGenerationDialogProps {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  onGenerationStart?(checkQuestionDatabase?: boolean): Promise<void>;
  getPromptPreview?(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
  ): string;
  onGenerate(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    checkQuestionDatabase?: boolean,
  ): Promise<GameQuestion>;
  excludedAnswers?: string[];
  onGenerated(question: GameQuestion): void;
}
