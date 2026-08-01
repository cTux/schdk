import type { LocalizationCopy } from '../../../localization';
import type { CustomGameElement } from '../../../options/types';

export interface VisualEditorSidebarProps {
  canRedo: boolean;
  canUndo: boolean;
  copy: LocalizationCopy;
  addElement(kind: CustomGameElement['kind']): void;
  onExportTemplate(): void;
  onImportTemplate(file: File): void;
  onRedo(): void;
  onUndo(): void;
}
