import type { AIQuestion, AIQuestionsPackageQuestion } from '@schdk/common';

export interface AIQuestionsPackageContextsProps {
  disabled: boolean;
  questionRules: AIQuestion[];
  value: AIQuestionsPackageQuestion[];
  onChange(value: AIQuestionsPackageQuestion[]): void;
}
