import type { GameOptions } from '../../options/types';

export interface VisualEditorProps {
  hidden: boolean;
  game: GameOptions;
  message: string;
  onChange(game: GameOptions): void;
  onImportTemplate(file: File): void;
  onExportTemplate(): void;
}
