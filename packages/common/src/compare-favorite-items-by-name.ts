import { type AIQuestion } from './ai-question.js';

export function compareFavoriteItemsByName(
  left: Pick<AIQuestion, 'favorite' | 'name'>,
  right: Pick<AIQuestion, 'favorite' | 'name'>,
) {
  return (
    Number(right.favorite) - Number(left.favorite) ||
    left.name.localeCompare(right.name)
  );
}
