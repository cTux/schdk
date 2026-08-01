import type { ElementSelection, GamePoint } from '../types';
import { getNextZoom } from '../utils/geometry';

interface VisualEditorState {
  panning: boolean;
  pan: GamePoint;
  zoom: number;
  selected: ElementSelection | null;
  imageTarget: 'background' | string | null;
  localMessage: string;
}

type VisualEditorAction =
  | { type: 'select'; selected: ElementSelection | null }
  | { type: 'pan'; pan: GamePoint }
  | { type: 'panning'; panning: boolean }
  | { type: 'choose-image'; target: 'background' | string | null }
  | { type: 'message'; message: string }
  | { type: 'zoom'; delta: number };

const INITIAL_VISUAL_EDITOR_STATE: VisualEditorState = {
  panning: false,
  pan: { x: 0, y: 0 },
  zoom: 1,
  selected: null,
  imageTarget: null,
  localMessage: '',
};

function reduceVisualEditor(
  state: VisualEditorState,
  action: VisualEditorAction,
): VisualEditorState {
  switch (action.type) {
    case 'select':
      return { ...state, selected: action.selected };
    case 'pan':
      return { ...state, pan: action.pan };
    case 'panning':
      return { ...state, panning: action.panning };
    case 'choose-image':
      return { ...state, imageTarget: action.target };
    case 'message':
      return { ...state, localMessage: action.message };
    case 'zoom':
      return { ...state, zoom: getNextZoom(state.zoom, action.delta) };
  }
}

export { INITIAL_VISUAL_EDITOR_STATE, reduceVisualEditor };
