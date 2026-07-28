import type { AIQuestion, AIQuestionsPackage } from '@schdk/common';
import type { ShellEditTarget } from '../ShellView/types';

export interface AIQuestionsPackagesPageProps {
  packages: AIQuestionsPackage[];
  questionRules: AIQuestion[];
  failed: boolean;
  loading: boolean;
  editTarget: Extract<ShellEditTarget, { kind: 'package' }> | null;
  onAdd(item: AIQuestionsPackage): Promise<boolean>;
  onCloseEditor(): void;
  onRemove(index: number): Promise<boolean>;
  onShowEditor(target: ShellEditTarget): void;
  onUpdate(index: number, item: AIQuestionsPackage): Promise<boolean>;
}
