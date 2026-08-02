import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { type GameOptions } from '../../types/game-options/game-options.js';
import { type GamePresentationOptions } from '../../types/game-options/game-presentation-options.js';
import { normalizeGameOptions } from '../../validators/game-options/normalize-game-options.js';

const MAX_VISUAL_TEMPLATE_BYTES = 16 * 1024 * 1024;
const VISUAL_TEMPLATE_ENTRY = 'template.json';

type VisualEditorTemplate = GamePresentationOptions;

function parseVisualEditorTemplate(
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

function serializeVisualEditorTemplate(
  options: GamePresentationOptions,
): Uint8Array {
  const template: VisualEditorTemplate & { version: 1 } = {
    version: 1,
    layout: options.layout,
    customElements: options.customElements,
    backgroundImage: options.backgroundImage,
    backgroundOpacity: options.backgroundOpacity,
    backgroundGradientFrom: options.backgroundGradientFrom,
    backgroundGradientTo: options.backgroundGradientTo,
    backgroundGradientDirection: options.backgroundGradientDirection,
  };
  return zipSync(
    {
      [VISUAL_TEMPLATE_ENTRY]: strToU8(JSON.stringify(template, null, 2)),
    },
    { level: 9 },
  );
}

export {
  MAX_VISUAL_TEMPLATE_BYTES,
  VISUAL_TEMPLATE_ENTRY,
  parseVisualEditorTemplate,
  serializeVisualEditorTemplate,
};
