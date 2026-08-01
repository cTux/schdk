import { DEFAULT_GAME_LAYOUT } from '../../constants/game-options/default-game-layout.js';
import { GAME_LAYOUT_ELEMENT_IDS } from '../../constants/game-options/game-layout-element-ids.js';
import { type GameLayout } from '../../types/game-options/game-layout.js';
import {
  isGameLayoutElement,
  isGameLayoutPosition,
} from './is-game-layout-element.js';

function normalizeGameLayout(value: unknown): GameLayout | null {
  if (value === undefined || value === null) return null;
  if (!value || typeof value !== 'object') return null;
  const positions = { ...(value as Record<string, unknown>) };
  if (positions.logo === undefined) positions.logo = DEFAULT_GAME_LAYOUT.logo;
  if (
    positions['alternative-answer'] === undefined &&
    isGameLayoutPosition(positions.answer)
  ) {
    const answerPosition = positions.answer;
    positions['alternative-answer'] = {
      ...DEFAULT_GAME_LAYOUT['alternative-answer'],
      x: answerPosition.x,
      y: Math.max(0, answerPosition.y - 18),
    };
  }
  const normalized = {} as GameLayout;
  for (const id of GAME_LAYOUT_ELEMENT_IDS) {
    const position = positions[id];
    if (!isGameLayoutPosition(position)) return null;
    const candidate = {
      ...DEFAULT_GAME_LAYOUT[id],
      ...(position as Partial<(typeof DEFAULT_GAME_LAYOUT)[typeof id]>),
    };
    delete (candidate as Record<string, unknown>).backgroundImage;
    delete (candidate as Record<string, unknown>).backgroundOpacity;
    if (!isGameLayoutElement(candidate)) return null;
    normalized[id] = candidate;
  }
  return normalized;
}

export { normalizeGameLayout };
