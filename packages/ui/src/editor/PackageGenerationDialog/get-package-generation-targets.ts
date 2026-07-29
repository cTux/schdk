import { type GamePackage } from '@schdk/common';
import { type PackageGenerationScope } from './package-generation-scope';

export function getPackageGenerationTargets(
  gamePackage: GamePackage,
  scope: PackageGenerationScope,
) {
  return gamePackage.questions.flatMap((question, index) =>
    scope === 'all' ||
    (scope === 'commented'
      ? Boolean(question.comment?.trim())
      : !question.answer.trim() ||
        question.questionParts.some((part) => !part.trim()))
      ? [index]
      : [],
  );
}
