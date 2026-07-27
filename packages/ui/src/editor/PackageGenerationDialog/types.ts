import type { GamePackage, GameQuestion } from '@schdk/common';
import type { AiQuestionGenerationOptions } from '../types';

export interface PackageGenerationDialogProps extends AiQuestionGenerationOptions {
  gamePackage: GamePackage;
  onGenerated(index: number, question: GameQuestion): void;
  onSelectQuestion(index: number): void;
}
