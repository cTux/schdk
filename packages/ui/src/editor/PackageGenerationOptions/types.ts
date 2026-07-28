import type { AIQuestionDifficulty, AIQuestionsPackage } from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  difficulty: AIQuestionDifficulty;
  hasRandomTemplates: boolean;
  ruleSet: PackageGenerationRuleSet;
  scope: PackageGenerationScope;
  selected: number | null;
  hasTargets: boolean;
  thinking: boolean;
  checkQuestionDatabase: boolean;
  onCheckQuestionDatabaseChange(checked: boolean): void;
  onDifficultyChange(difficulty: AIQuestionDifficulty): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
}
