import type { AIQuestionDifficulty, AIQuestionsPackage } from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  canGenerate: boolean;
  difficulty: AIQuestionDifficulty;
  hasRandomTemplates: boolean;
  progress: [number, number] | null;
  ruleSet: PackageGenerationRuleSet;
  scope: PackageGenerationScope;
  selected: number | null;
  hasTargets: boolean;
  thinking: boolean;
  checkQuestionDatabase: boolean;
  onCheckQuestionDatabaseChange(checked: boolean): void;
  onCancel(): void;
  onDifficultyChange(difficulty: AIQuestionDifficulty): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
  onGenerate(): void;
}
