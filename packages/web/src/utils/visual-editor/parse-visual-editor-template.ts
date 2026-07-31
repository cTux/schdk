import { normalizeGameOptions, type GameOptions } from '@schdk/common';
import { strFromU8, strToU8, unzipSync } from 'fflate';
import { MAX_VISUAL_TEMPLATE_BYTES } from '../../storage/options/game-options-storage';
import { VISUAL_TEMPLATE_ENTRY } from '../../types/visual-editor/visual-template-entry';

export function parseVisualEditorTemplate(
  content: string | Uint8Array,
  options: Pick<GameOptions, 'autoFullscreen' | 'soundVolume' | 'musicVolume'>,
): GameOptions | null {
  try {
    if (
      (typeof content === 'string'
        ? strToU8(content).byteLength
        : content.byteLength) > MAX_VISUAL_TEMPLATE_BYTES
    ) {
      return null;
    }
    const seenEntries = new Set<string>();
    const isArchive =
      typeof content !== 'string' && content[0] === 0x50 && content[1] === 0x4b;
    const templateJson =
      typeof content === 'string'
        ? content
        : isArchive
          ? strFromU8(
              unzipSync(content, {
                filter: ({ name, originalSize }) => {
                  if (name !== VISUAL_TEMPLATE_ENTRY) return false;
                  if (
                    seenEntries.has(name) ||
                    originalSize > MAX_VISUAL_TEMPLATE_BYTES
                  ) {
                    throw new Error('Invalid visual editor template');
                  }
                  seenEntries.add(name);
                  return true;
                },
              })[VISUAL_TEMPLATE_ENTRY],
            )
          : strFromU8(content);
    const value = JSON.parse(templateJson) as Record<string, unknown> | null;
    if (!value || value.version !== 1) return null;
    return normalizeGameOptions({ ...value, ...options });
  } catch {
    return null;
  }
}
