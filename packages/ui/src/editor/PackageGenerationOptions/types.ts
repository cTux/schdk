import type { AIQuestionsPackage } from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  hasRandomTemplates: boolean;
  ruleSet: PackageGenerationRuleSet;
  scope: PackageGenerationScope;
  selected: number | null;
  targetsMissing: boolean;
  thinking: boolean;
  checkQuestionDatabase: boolean;
  onCheckQuestionDatabaseChange(checked: boolean): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
}
