import type { AIQuestion } from '@schdk/common';

export interface AIQuestionCardProps {
  question: AIQuestion;
  onDelete?(): Promise<boolean>;
  onEdit?(): void;
  onUpdate?(question: AIQuestion): Promise<boolean>;
  onSaveFailed(): void;
}
