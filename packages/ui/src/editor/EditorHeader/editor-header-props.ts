import type { GamePackage, GameQuestion } from '@schdk/common';
import type { AiQuestionGenerationOptions, EditorSaveStatus } from '../types';

export interface EditorHeaderProps {
  hasPackage: boolean;
  packageTitle: string;
  saveStatus: EditorSaveStatus;
  showValidation: boolean;
  onBack(): void;
  onDeletePackage(): void;
  onTitleChange(value: string): void;
  aiGeneration?: AiQuestionGenerationOptions;
  gamePackage: GamePackage;
  onQuestionGenerated(index: number, question: GameQuestion): void;
  onPackageGenerationStateChange(
    pendingIndexes: number[],
    docked: boolean,
  ): void;
  onSelectQuestion(index: number): void;
}
