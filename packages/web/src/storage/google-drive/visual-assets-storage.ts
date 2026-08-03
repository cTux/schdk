import type { GameOptions } from '@schdk/common/game-options';
import type {
  DriveSettingsDocument,
  DriveVisualAssetsDocument,
} from '@schdk/google-drive';
import type { EditorTextOptions } from '@schdk/common/app-settings';
import type { WebDriveSettingsDocument } from '../../types/google-drive/web-drive-settings-document';

const REFERENCE_PREFIX = 'schdk-visual-asset:';

function reference(id: string) {
  return `${REFERENCE_PREFIX}${id}`;
}

function referenceId(value: unknown) {
  return typeof value === 'string' && value.startsWith(REFERENCE_PREFIX)
    ? value.slice(REFERENCE_PREFIX.length)
    : null;
}

function mapImages(
  options: GameOptions,
  transform: (value: string | null) => string | null,
): GameOptions {
  return {
    ...options,
    backgroundImage: transform(options.backgroundImage),
    customElements: options.customElements.map((element) =>
      element.kind === 'image'
        ? { ...element, image: transform(element.image) }
        : element,
    ),
  };
}

export function collectVisualAssetReferences(value: unknown): Set<string> {
  const references = new Set<string>();
  if (!value || typeof value !== 'object') return references;
  const game = ((value as { sections?: { gameOptions?: { value?: unknown } } })
    .sections?.gameOptions?.value ?? null) as Record<string, unknown> | null;
  const add = (image: unknown) => {
    const id = referenceId(image);
    if (id) references.add(id);
  };
  add(game?.backgroundImage);
  if (Array.isArray(game?.customElements)) {
    for (const element of game.customElements) {
      if (element && typeof element === 'object') {
        add((element as Record<string, unknown>).image);
      }
    }
  }
  return references;
}

export function hydrateVisualAssets(
  value: unknown,
  assets: DriveVisualAssetsDocument,
): unknown {
  if (!value || typeof value !== 'object') return value;
  const settings = value as DriveSettingsDocument<unknown, unknown>;
  const game = settings.sections?.gameOptions?.value;
  if (!game || typeof game !== 'object') return value;
  const options = game as Record<string, unknown>;
  const resolve = (image: unknown) => {
    const id = referenceId(image);
    return id ? (assets.assets[id] ?? null) : image;
  };
  const customElements = Array.isArray(options.customElements)
    ? options.customElements.map((element) =>
        element && typeof element === 'object'
          ? {
              ...element,
              image: resolve((element as Record<string, unknown>).image),
            }
          : element,
      )
    : options.customElements;
  return {
    ...settings,
    sections: {
      ...settings.sections,
      gameOptions: {
        ...settings.sections.gameOptions,
        value: {
          ...options,
          backgroundImage: resolve(options.backgroundImage),
          customElements,
        },
      },
    },
  };
}

export function externalizeVisualAssets(
  settings: WebDriveSettingsDocument,
  existing: DriveVisualAssetsDocument,
  protectedIds: ReadonlySet<string>,
  createId: () => string = () => crypto.randomUUID(),
): {
  assets: DriveVisualAssetsDocument;
  settings: DriveSettingsDocument<EditorTextOptions, GameOptions>;
} {
  const assets = { ...existing.assets };
  const used = new Set(protectedIds);
  const store = (image: string | null) => {
    if (!image) return image;
    const found = Object.entries(assets).find(
      ([, data]) => data === image,
    )?.[0];
    const id = found ?? createId();
    assets[id] = image;
    used.add(id);
    return reference(id);
  };
  const game = mapImages(settings.sections.gameOptions.value, store);
  return {
    assets: {
      schemaVersion: 1,
      assets: Object.fromEntries(
        Object.entries(assets).filter(([id]) => used.has(id)),
      ),
    },
    settings: {
      ...settings,
      sections: {
        ...settings.sections,
        gameOptions: { ...settings.sections.gameOptions, value: game },
      },
    },
  };
}
