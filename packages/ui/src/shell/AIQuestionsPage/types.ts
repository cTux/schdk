import type { AIQuestion } from '@schdk/common';

export interface AIQuestionsPageProps {
  questions: AIQuestion[];
  globalQuestions: AIQuestion[];
  failed: boolean;
  globalFailed: boolean;
  loading: boolean;
  globalLoading: boolean;
  isGlobalAdmin: boolean;
  onAdd(question: AIQuestion): Promise<boolean>;
  onAddGlobal(question: AIQuestion): Promise<boolean>;
  onRemove(index: number): Promise<boolean>;
  onRemoveGlobal(index: number): Promise<boolean>;
  onUpdate(index: number, question: AIQuestion): Promise<boolean>;
  onUpdateGlobal(index: number, question: AIQuestion): Promise<boolean>;
}
