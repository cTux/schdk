import { position } from './position';

export const customElement = {
  id: 'story-element',
  kind: 'text' as const,
  text: 'Власний елемент',
  position,
};
