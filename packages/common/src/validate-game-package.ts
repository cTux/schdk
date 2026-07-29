import { validateGamePackageReadiness } from './game-package-validation.js';
import { type GamePackage } from './game-package.js';
import { QUESTION_COUNT } from './question-count.js';

export function validateGamePackage(gamePackage: GamePackage): string[] {
  return validateGamePackageReadiness(gamePackage, QUESTION_COUNT);
}
