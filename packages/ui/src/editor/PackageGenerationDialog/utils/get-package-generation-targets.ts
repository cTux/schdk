import type { GamePackage } from '@schdk/common/game-packages';
import { type PackageGenerationScope } from '../types/package-generation-scope';

export function getPackageGenerationTargets(
  gamePackage: GamePackage,
  scope: PackageGenerationScope,
) {
  return gamePackage.questions.flatMap((question, index) => {
    const hasComment = Boolean(question.comment?.trim());
    const hasMissingContent =
      !question.answer.trim() ||
      question.questionParts.some((part) => !part.trim());
    const isInScope =
      scope === 'all' ||
      (scope === 'commented' ? hasComment : hasMissingContent);
    return isInScope ? [index] : [];
  });
}
