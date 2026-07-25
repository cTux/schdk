import type { PointerEvent, ReactNode } from 'react';
import type { GameLayoutPosition } from '../../../options/types';
import type { ElementSelection, GamePoint } from '../types';

export interface VisualLayoutItemProps {
  content: ReactNode;
  fitWarningLabel: string;
  hiddenLabel: string;
  hiddenSuffix: string;
  dragInstruction: string;
  label: string;
  position: GameLayoutPosition;
  selected: boolean;
  selection: ElementSelection;
  onRemove(): void;
  onSelect(): void;
  onUpdate(patch: Partial<GameLayoutPosition>): void;
  pointerPosition(event: PointerEvent<HTMLElement>): GamePoint | null;
}
