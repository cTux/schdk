import type { AIQuestion } from '@schdk/common';
import type { LocalizationCopy } from '../../../localization';

export interface AIQuestionFormProps {
  copy: LocalizationCopy;
  draft: AIQuestion;
  editingGlobal: boolean;
  editingIndex: number | null;
  formSaving: boolean;
  isGlobalAdmin: boolean;
  onChange(
    field: 'name' | 'description' | 'goodExamples' | 'badExamples',
    value: string,
  ): void;
  onClose(): void;
  onGeneralRuleChange(checked: boolean): void;
  onSave(question: AIQuestion): Promise<void>;
  saveFailed: boolean;
}
