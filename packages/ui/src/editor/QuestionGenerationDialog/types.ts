import type { AIQuestion, GameQuestion } from '@schdk/common';

export interface QuestionGenerationDialogProps {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  getPromptPreview?(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
  ): string;
  onGenerate(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
  ): Promise<GameQuestion>;
  excludedAnswers?: string[];
  onGenerated(question: GameQuestion): void;
}
