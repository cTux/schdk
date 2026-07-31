import {
  getDefaultCustomElementPosition,
  type CustomGameElement,
} from '../../../options/types';

export function createCustomElement(
  kind: CustomGameElement['kind'],
  index: number,
  id: string = crypto.randomUUID(),
  text = '\u0422\u0435\u043a\u0441\u0442',
): CustomGameElement {
  const base = {
    id,
    position: getDefaultCustomElementPosition(kind, (index % 6) * 3),
  };
  return kind === 'text'
    ? { ...base, kind, text }
    : { ...base, kind, image: null };
}
