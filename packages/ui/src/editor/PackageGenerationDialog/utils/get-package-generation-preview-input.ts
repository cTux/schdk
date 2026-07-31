import {
  type AIQuestion,
  type AIQuestionsPackage,
  type GameQuestion,
} from '@schdk/common';
import { type PackageGenerationRuleSet } from '../types/package-generation-rule-set';
import { getPackageGenerationInput } from './get-package-generation-input';

export function getPackageGenerationPreviewInput(
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  index: number | undefined,
  ruleSet: PackageGenerationRuleSet,
  currentQuestion?: GameQuestion,
) {
  return index === undefined
    ? null
    : getPackageGenerationInput(
        selectedPackage,
        templates,
        index,
        ruleSet,
        currentQuestion,
        () => 0,
      );
}
