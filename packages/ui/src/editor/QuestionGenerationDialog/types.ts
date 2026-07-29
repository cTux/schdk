import type {
  AIQuestion,
  AIQuestionDifficulty,
  AIQuestionRecognizability,
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
    recognizability?: AIQuestionRecognizability,
  ): string;
  onGenerate(
    template: AIQuestion,
    context: string,
    excludedAnswers?: string[],
    difficulty?: AIQuestionDifficulty,
    checkQuestionDatabase?: boolean,
    recognizability?: AIQuestionRecognizability,
  ): Promise<GameQuestion>;
  excludedAnswers?: string[];
  onGenerated(question: GameQuestion): void;
}
