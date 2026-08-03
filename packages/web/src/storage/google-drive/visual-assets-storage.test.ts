import { DEFAULT_GAME_OPTIONS } from '@schdk/common';
import { DEFAULT_EDITOR_TEXT_OPTIONS } from '@schdk/common/app-settings';
import { expect, it } from 'vitest';
import type { WebDriveSettingsDocument } from '../../types/google-drive/web-drive-settings-document';
import {
  externalizeVisualAssets,
  hydrateVisualAssets,
} from './visual-assets-storage';

it('moves visual images out of Drive settings and restores them', () => {
  const image = 'data:image/png;base64,AA==';
  const settings: WebDriveSettingsDocument = {
    schemaVersion: 1,
    sections: {
      editorTextOptions: {
        updatedAt: new Date(0).toISOString(),
        value: DEFAULT_EDITOR_TEXT_OPTIONS,
      },
      gameOptions: {
        updatedAt: new Date(0).toISOString(),
        value: { ...DEFAULT_GAME_OPTIONS, backgroundImage: image },
      },
      recentPackages: { updatedAt: new Date(0).toISOString(), value: [] },
    },
  };
  const stored = externalizeVisualAssets(
    settings,
    { schemaVersion: 1, assets: {} },
    new Set(),
    () => 'asset-id',
  );

  expect(stored.settings.sections.gameOptions.value.backgroundImage).toBe(
    'schdk-visual-asset:asset-id',
  );
  expect(stored.assets.assets).toEqual({ 'asset-id': image });
  expect(
    (
      hydrateVisualAssets(
        stored.settings,
        stored.assets,
      ) as WebDriveSettingsDocument
    ).sections.gameOptions.value.backgroundImage,
  ).toBe(image);
});
