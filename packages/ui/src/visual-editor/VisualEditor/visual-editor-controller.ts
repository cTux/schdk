import type { CustomGameElement } from '../../options/types';

export interface VisualEditorController {
  addElement(kind: CustomGameElement['kind']): void;
}
