import type { LocalizationCopy } from '../../../localization';
import type { CustomGameElement } from '../../../options/types';

export interface VisualEditorSidebarProps {
  copy: LocalizationCopy;
  addElement(kind: CustomGameElement['kind']): void;
  onExportTemplate(): void;
  onImportTemplate(file: File): void;
}
