import { strFromU8, strToU8, unzip, zip } from 'fflate';
import { type GameOptions } from '../../types/game-options/game-options.js';
import { type GamePresentationOptions } from '../../types/game-options/game-presentation-options.js';
import { normalizeGameOptions } from '../../validators/game-options/normalize-game-options.js';

const MAX_VISUAL_TEMPLATE_BYTES = 16 * 1024 * 1024;
const VISUAL_TEMPLATE_ENTRY = 'template.json';

type VisualEditorTemplate = GamePresentationOptions;

function unzipVisualEditorTemplate(content: Uint8Array): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const seenEntries = new Set<string>();
    unzip(
      content,
      {
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
      },
      (error, files) => {
        const template = files?.[VISUAL_TEMPLATE_ENTRY];
        if (error || !template) {
          reject(error ?? new Error('Invalid visual editor template'));
          return;
        }
        resolve(template);
      },
    );
  });
}

async function parseVisualEditorTemplate(
  content: string | Uint8Array,
  options: Pick<GameOptions, 'autoFullscreen' | 'soundVolume' | 'musicVolume'>,
): Promise<GameOptions | null> {
  try {
    if (
      (typeof content === 'string'
        ? strToU8(content).byteLength
        : content.byteLength) > MAX_VISUAL_TEMPLATE_BYTES
    ) {
      return null;
    }
    const isArchive =
      typeof content !== 'string' && content[0] === 0x50 && content[1] === 0x4b;
    const templateJson =
      typeof content === 'string'
        ? content
        : isArchive
          ? strFromU8(await unzipVisualEditorTemplate(content))
          : strFromU8(content);
    const value = JSON.parse(templateJson) as Record<string, unknown> | null;
    if (!value || value.version !== 1) return null;
    return normalizeGameOptions({ ...value, ...options });
  } catch {
    return null;
  }
}

async function serializeVisualEditorTemplate(
  options: GamePresentationOptions,
): Promise<Uint8Array> {
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
  return new Promise((resolve, reject) =>
    zip(
      { [VISUAL_TEMPLATE_ENTRY]: strToU8(JSON.stringify(template, null, 2)) },
      { level: 9 },
      (error, content) => {
        if (error) reject(error);
        else resolve(content);
      },
    ),
  );
}

export {
  MAX_VISUAL_TEMPLATE_BYTES,
  VISUAL_TEMPLATE_ENTRY,
  parseVisualEditorTemplate,
  serializeVisualEditorTemplate,
};
