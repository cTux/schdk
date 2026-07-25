import type {
  CustomGameElement,
  GameLayoutElementId,
  GameLayoutPosition,
  GameOptions,
} from '../../options/types';
import { RESIZE_HANDLES } from './constants';

export type GamePoint = Pick<GameLayoutPosition, 'x' | 'y'>;
export type ResizeHandle = (typeof RESIZE_HANDLES)[number];
export type ElementSelection =
  | { kind: 'built-in'; id: GameLayoutElementId }
  | { kind: 'custom'; id: string };

export interface VisualEditorProps {
  hidden: boolean;
  game: GameOptions;
  message: string;
  onChange(game: GameOptions): void;
  onImportTemplate(file: File): void;
  onExportTemplate(): void;
}

export interface VisualEditorController {
  addElement(kind: CustomGameElement['kind']): void;
}
