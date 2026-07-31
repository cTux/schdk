import type { GameLayoutPosition } from '../../options/types';
import { type ResizeHandle } from './types/resize-handle';
import { type ElementSelection } from './types/element-selection';
import { type VisualEditorProps } from './types/visual-editor-props';

type GamePoint = Pick<GameLayoutPosition, 'x' | 'y'>;

export {
  type GamePoint,
  type ResizeHandle,
  type ElementSelection,
  type VisualEditorProps,
};
