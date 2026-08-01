import type { GameOptions } from '../../../options/types';

export interface VisualEditorProps {
  canRedo: boolean;
  canUndo: boolean;
  hidden: boolean;
  game: GameOptions;
  message: string;
  onChange(game: GameOptions): void;
  onImportTemplate(file: File): void;
  onExportTemplate(): void;
  onRedo(): void;
  onUndo(): void;
}
