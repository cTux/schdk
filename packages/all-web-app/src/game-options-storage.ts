import { DEFAULT_GAME_OPTIONS, type GameOptions } from '@schdk/ui/options';
import { strFromU8, strToU8, unzipSync, zipSync } from 'fflate';
import { normalizeGameOptions } from './game-options-validation';

const GAME_OPTIONS_KEY = 'schdk:game-options';
const VISUAL_TEMPLATE_ENTRY = 'template.json';
export const MAX_VISUAL_TEMPLATE_BYTES = 16 * 1024 * 1024;
type OptionsStorage = Pick<Storage, 'getItem' | 'setItem'>;
type VisualEditorTemplate = Omit<
  GameOptions,
  'autoFullscreen' | 'soundVolume' | 'musicVolume'
>;

export function loadGameOptions(storage: OptionsStorage): GameOptions {
  try {
    return (
      normalizeGameOptions(
        JSON.parse(storage.getItem(GAME_OPTIONS_KEY) ?? 'null'),
      ) ?? DEFAULT_GAME_OPTIONS
    );
  } catch {
    return DEFAULT_GAME_OPTIONS;
  }
}

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
    const templateJson =
      typeof content === 'string'
        ? content
        : content[0] === 0x50 && content[1] === 0x4b
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

export async function parseVisualEditorTemplateFile(
  file: File,
  options: Pick<GameOptions, 'autoFullscreen' | 'soundVolume' | 'musicVolume'>,
): Promise<GameOptions | null> {
  const content = await file
    .slice(0, MAX_VISUAL_TEMPLATE_BYTES + 1)
    .arrayBuffer();
  return parseVisualEditorTemplate(new Uint8Array(content), options);
}

export function serializeVisualEditorTemplate(
  options: GameOptions,
): Uint8Array {
  const template: VisualEditorTemplate & { version: 1 } = {
    version: 1,
    layout: options.layout,
    customElements: options.customElements,
    backgroundImage: options.backgroundImage,
    backgroundOpacity: options.backgroundOpacity,
  };
  return zipSync(
    {
      [VISUAL_TEMPLATE_ENTRY]: strToU8(JSON.stringify(template, null, 2)),
    },
    { level: 9 },
  );
}

export function saveGameOptions(
  storage: OptionsStorage,
  options: GameOptions,
): boolean {
  try {
    storage.setItem(GAME_OPTIONS_KEY, JSON.stringify(options));
    return true;
  } catch {
    return false;
  }
}
