import { getDraggedPosition } from './get-dragged-position';
import { getResizedPosition } from './get-resized-position';
import { createCustomElement } from './create-custom-element';

const clampZoom = (value: number) => Math.min(2.5, Math.max(0.5, value));

const getNextZoom = (current: number, deltaY: number) =>
  clampZoom(current * (deltaY < 0 ? 1.1 : 0.9));

export {
  getNextZoom,
  getDraggedPosition,
  getResizedPosition,
  createCustomElement,
};
