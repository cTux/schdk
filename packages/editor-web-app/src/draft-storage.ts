import { parseGamePackage, type GamePackage } from '@schdk/common';

const DRAFT_PREFIX = 'schdk:editor-draft:';

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

function draftKey(fileName: string) {
  return `${DRAFT_PREFIX}${fileName}`;
}

export function saveDraft(
  storage: DraftStorage,
  fileName: string,
  gamePackage: GamePackage,
) {
  storage.setItem(draftKey(fileName), JSON.stringify(gamePackage));
}

export function loadDraft(
  storage: DraftStorage,
  fileName: string,
): GamePackage | null {
  const content = storage.getItem(draftKey(fileName));
  if (!content) return null;

  try {
    return parseGamePackage(content);
  } catch {
    storage.removeItem(draftKey(fileName));
    return null;
  }
}

export function removeDraft(storage: DraftStorage, fileName: string) {
  storage.removeItem(draftKey(fileName));
}
