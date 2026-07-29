import {
  getGameQuestionAnswers,
  type AIQuestion,
  type AIQuestionsPackage,
  type GamePackage,
} from '@schdk/common';
import { type PackageGenerationScope } from './package-generation-scope';
import { type PackageGenerationRuleSet } from './package-generation-rule-set';
import { type PackageGenerationInput } from './package-generation-input';
import { getPackageGenerationTargets } from './get-package-generation-targets';
import { getPackageGenerationPreviewInput } from './get-package-generation-preview-input';

function getPackageGenerationExcludedAnswers(
  gamePackage: GamePackage,
  targets: number[],
) {
  return gamePackage.questions.flatMap((question, index) =>
    targets.includes(index) ? [] : getGameQuestionAnswers(question),
  );
}

export function getPackageGenerationState(
  gamePackage: GamePackage,
  scope: PackageGenerationScope,
  selectedPackage: AIQuestionsPackage | undefined,
  templates: AIQuestion[],
  ruleSet: PackageGenerationRuleSet,
  progress: [number, number] | null,
  currentInput: PackageGenerationInput | null,
) {
  const targets = getPackageGenerationTargets(gamePackage, scope);
  const previewIndex = targets[progress ? progress[0] - 1 : 0];
  return {
    targets,
    initialExcludedAnswers: getPackageGenerationExcludedAnswers(
      gamePackage,
      targets,
    ),
    previewInput:
      currentInput ??
      getPackageGenerationPreviewInput(
        selectedPackage,
        templates,
        previewIndex,
        ruleSet,
        scope === 'commented' && previewIndex !== undefined
          ? gamePackage.questions[previewIndex]
          : undefined,
      ),
  };
}
