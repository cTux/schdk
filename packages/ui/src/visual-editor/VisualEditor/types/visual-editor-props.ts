import type { GamePresentationOptions } from '../../../options/types';

export interface VisualEditorProps {
  canRedo: boolean;
  canUndo: boolean;
  hidden: boolean;
  game: GamePresentationOptions;
  message: string;
  onChange(game: GamePresentationOptions): void;
  onImportTemplate(file: File): void;
  onExportTemplate(): void;
  onRedo(): void;
  onUndo(): void;
}
