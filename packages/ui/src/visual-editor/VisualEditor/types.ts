import type { GameLayoutPosition } from '../../options/types';
import { type ResizeHandle } from './resize-handle';
import { type ElementSelection } from './element-selection';
import { type VisualEditorProps } from './visual-editor-props';
import { type VisualEditorController } from './visual-editor-controller';

type GamePoint = Pick<GameLayoutPosition, 'x' | 'y'>;

export {
  type GamePoint,
  type ResizeHandle,
  type ElementSelection,
  type VisualEditorProps,
  type VisualEditorController,
};
