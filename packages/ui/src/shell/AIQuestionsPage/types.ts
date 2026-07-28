import type { AIQuestion } from '@schdk/common';
import type { ShellEditTarget } from '../ShellView/types';

export interface AIQuestionsPageProps {
  questions: AIQuestion[];
  globalQuestions: AIQuestion[];
  failed: boolean;
  globalFailed: boolean;
  loading: boolean;
  globalLoading: boolean;
  isGlobalAdmin: boolean;
  editTarget: Extract<ShellEditTarget, { kind: 'question' }> | null;
  onAdd(question: AIQuestion): Promise<boolean>;
  onAddGlobal(question: AIQuestion): Promise<boolean>;
  onRemove(index: number): Promise<boolean>;
  onRemoveGlobal(index: number): Promise<boolean>;
  onCloseEditor(): void;
  onShowEditor(target: ShellEditTarget): void;
  onUpdate(index: number, question: AIQuestion): Promise<boolean>;
  onUpdateGlobal(index: number, question: AIQuestion): Promise<boolean>;
}
