import type {
  AIQuestionDifficulty,
  AIQuestionRecognizability,
  AIQuestionsPackage,
} from '@schdk/common';
import type {
  PackageGenerationRuleSet,
  PackageGenerationScope,
} from '../PackageGenerationDialog/generation-input';

export interface PackageGenerationOptionsProps {
  activePackages: AIQuestionsPackage[];
  canGenerate: boolean;
  difficulty: AIQuestionDifficulty;
  recognizability: AIQuestionRecognizability;
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
  onRecognizabilityChange(recognizability: AIQuestionRecognizability): void;
  onPackageChange(index: number): void;
  onRuleSetChange(ruleSet: PackageGenerationRuleSet): void;
  onScopeChange(scope: PackageGenerationScope): void;
  onGenerate(): void;
}
