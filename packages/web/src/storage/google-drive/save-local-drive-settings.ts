import { type SettingsStorage } from '../settings/settings-storage';
import { METADATA_KEY } from '../../constants/visual-editor/metadata-key';
import type { WebDriveSettingsDocument } from '../../types/google-drive/web-drive-settings-document';

export function saveLocalDriveSettings(
  storage: SettingsStorage,
  settings: WebDriveSettingsDocument,
) {
  try {
    storage.setItem(
      METADATA_KEY,
      JSON.stringify({
        ...settings,
        sections: {
          editorTextOptions: {
            updatedAt: settings.sections.editorTextOptions.updatedAt,
            value: null,
          },
          gameOptions: {
            updatedAt: settings.sections.gameOptions.updatedAt,
            value: null,
          },
          recentPackages: settings.sections.recentPackages,
        },
      }),
    );
  } catch {
    // Local option storage remains the primary fallback.
  }
}
