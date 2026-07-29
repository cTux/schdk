import { type ValidatableGamePackage } from './validatable-game-package.js';
import { validateGamePackageReadiness } from './validate-game-package-readiness.js';

function hasGamePackageRemarks(gamePackage: ValidatableGamePackage) {
  return gamePackage.questions.some((question) => question.comment?.trim());
}

export { hasGamePackageRemarks, validateGamePackageReadiness };
