import type { AIQuestion } from '@schdk/common';

export interface AIQuestionCollectionProps {
  title: string;
  emptyLabel: string;
  questions: AIQuestion[];
  loading: boolean;
  editable: boolean;
  addLabel?: string;
  onAdd?(): void;
  onEdit(question: AIQuestion, index: number): void;
  onRemove(index: number): Promise<boolean>;
  onUpdate(index: number, question: AIQuestion): Promise<boolean>;
  onSaveFailed(): void;
}
