import type { AIQuestion, GameQuestion } from '@schdk/common';

export interface QuestionGenerationDialogProps {
  apiKeyConfigured: boolean;
  templates: AIQuestion[];
  onGenerate(template: AIQuestion, context: string): Promise<GameQuestion>;
  onGenerated(question: GameQuestion): void;
}
