import type { AIQuestion } from '@schdk/common';

export interface AIQuestionsPageProps {
  questions: AIQuestion[];
  onAdd(question: AIQuestion): boolean;
}
