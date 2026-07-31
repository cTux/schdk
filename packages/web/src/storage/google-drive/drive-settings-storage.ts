import {
  parseDriveSettingsDocument,
  type DriveSettingsDocument,
} from '@schdk/google-drive';
import type { GameOptions } from '@schdk/common';
import type { EditorTextOptions } from '@schdk/ui/options';
import { type SettingsStorage } from '../settings/settings-storage';
import { METADATA_KEY } from '../../constants/visual-editor/metadata-key';
import { saveLocalDriveSettings } from './save-local-drive-settings';
import { initializeDriveSettings } from '../../services/google-drive/initialize-drive-settings';
import { mergeDriveSettings } from '../../utils/google-drive/merge-drive-settings';
import type { WebDriveSettingsDocument } from '../../types/google-drive/web-drive-settings-document';

const EPOCH = new Date(0).toISOString();

function loadLocalDriveSettings(
  storage: SettingsStorage,
  editorTextOptions: EditorTextOptions,
  gameOptions: GameOptions,
): WebDriveSettingsDocument {
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
