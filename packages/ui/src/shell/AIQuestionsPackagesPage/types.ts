import type { AIQuestion, AIQuestionsPackage } from '@schdk/common';

export interface AIQuestionsPackagesPageProps {
  packages: AIQuestionsPackage[];
  questionRules: AIQuestion[];
  failed: boolean;
  loading: boolean;
  onAdd(item: AIQuestionsPackage): Promise<boolean>;
  onRemove(index: number): Promise<boolean>;
  onUpdate(index: number, item: AIQuestionsPackage): Promise<boolean>;
}
