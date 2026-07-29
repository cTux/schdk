import {
  parseDriveSettingsDocument,
  type DriveSettingsDocument,
} from '@schdk/google-drive';
import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { type SettingsStorage } from './settings-storage';
import { METADATA_KEY } from './metadata-key';
import { saveLocalDriveSettings } from './save-local-drive-settings';
import { initializeDriveSettings } from './initialize-drive-settings';
import { mergeDriveSettings } from './merge-drive-settings';

const EPOCH = new Date(0).toISOString();

function loadLocalDriveSettings(
  storage: SettingsStorage,
  editorTextOptions: EditorTextOptions,
  gameOptions: GameOptions,
): DriveSettingsDocument {
  let stored: DriveSettingsDocument | null = null;
  try {
    stored = parseDriveSettingsDocument(
      JSON.parse(storage.getItem(METADATA_KEY) ?? 'null'),
    );
  } catch {
    // Invalid sync metadata must not affect local settings.
  }
  return {
    schemaVersion: 1,
    sections: {
      editorTextOptions: {
        updatedAt: stored?.sections.editorTextOptions.updatedAt ?? EPOCH,
        value: editorTextOptions,
      },
      gameOptions: {
        updatedAt: stored?.sections.gameOptions.updatedAt ?? EPOCH,
        value: gameOptions,
      },
      recentPackages: stored?.sections.recentPackages ?? {
        updatedAt: EPOCH,
        value: [],
      },
    },
  };
}

export {
  loadLocalDriveSettings,
  saveLocalDriveSettings,
  initializeDriveSettings,
  mergeDriveSettings,
};
