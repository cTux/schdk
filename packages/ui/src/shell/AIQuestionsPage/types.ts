import type { AIQuestion } from '@schdk/common';

export interface AIQuestionsPageProps {
  questions: AIQuestion[];
  onAdd(question: AIQuestion): boolean;
  onRemove(index: number): boolean;
  onUpdate(index: number, question: AIQuestion): boolean;
}
