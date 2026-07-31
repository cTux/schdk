import type { AIQuestionsPackage, SchdkDictionaryItem } from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/utils/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  canGenerate: boolean;
  difficultyDistribution: string;
  recognizability: string;
  difficultyDistributions: SchdkDictionaryItem[];
  recognizabilityDistributions: SchdkDictionaryItem[];
  hasRandomTemplates: boolean;
  progress: [number, number] | null;
  ruleSet: PackageGenerationRuleSet;
  scope: PackageGenerationScope;
  selected: number | null;
  hasTargets: boolean;
  thinking: boolean;
  onCancel(): void;
  onDifficultyDistributionChange(value: string): void;
  onRecognizabilityDistributionChange(value: string): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
  onGenerate(): void;
}
