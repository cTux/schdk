import type {
  AIQuestionDifficulty,
  AIQuestionRecognizability,
  AIQuestionsPackage,
  SchdkDictionaryItem,
} from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/utils/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  canGenerate: boolean;
  difficultyDistribution: Record<AIQuestionDifficulty, number>;
  recognizability: AIQuestionRecognizability;
  difficulties: SchdkDictionaryItem[];
  recognizabilities: SchdkDictionaryItem[];
  hasRandomTemplates: boolean;
  progress: [number, number] | null;
  ruleSet: PackageGenerationRuleSet;
  scope: PackageGenerationScope;
  selected: number | null;
  hasTargets: boolean;
  thinking: boolean;
  onCancel(): void;
  onDifficultyPercentageChange(
    difficulty: AIQuestionDifficulty,
    percentage: number,
  ): void;
  onRecognizabilityChange(recognizability: AIQuestionRecognizability): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
  onGenerate(): void;
}
