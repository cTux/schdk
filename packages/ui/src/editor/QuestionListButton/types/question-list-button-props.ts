import type { GameQuestion } from '@schdk/common/game-question';
import type { DragEvent } from 'react';
import { type LocalizationCopy } from '../../../localization';

export interface QuestionListButtonProps {
  copy?: LocalizationCopy;
  dragging: boolean;
  dropTarget: boolean;
  duplicate?: boolean;
  index: number;
  question: GameQuestion;
  selected: boolean;
  showTooltip: boolean;
  showValidation: boolean;
  onDragEnd(): void;
  onDragEnter(): void;
  onDragOver(event: DragEvent<HTMLButtonElement>): void;
  onDragStart(event: DragEvent<HTMLButtonElement>): void;
  onDrop(event: DragEvent<HTMLButtonElement>): void;
  onSelect(): void;
}
