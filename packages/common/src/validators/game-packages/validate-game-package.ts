import { validateGamePackageReadiness } from './game-package-validation.js';
import { type GamePackage } from '../../types/game-packages/game-package.js';
import { QUESTION_COUNT } from '../../constants/game-questions/question-count.js';

export function validateGamePackage(gamePackage: GamePackage): string[] {
  return validateGamePackageReadiness(gamePackage, QUESTION_COUNT);
}
