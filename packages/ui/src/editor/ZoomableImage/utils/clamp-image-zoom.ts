import { MAX_ZOOM, MIN_ZOOM } from '../constants';

export function clampImageZoom(zoom: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}
