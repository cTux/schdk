import type { AIQuestion } from '@schdk/common';

export interface AIQuestionsPageProps {
  questions: AIQuestion[];
  failed: boolean;
  loading: boolean;
  onAdd(question: AIQuestion): Promise<boolean>;
  onRemove(index: number): Promise<boolean>;
  onUpdate(index: number, question: AIQuestion): Promise<boolean>;
}
