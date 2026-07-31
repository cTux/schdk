import { type DriveSettingsDocument } from '@schdk/google-drive';
import { type SettingsStorage } from '../settings/settings-storage';
import { METADATA_KEY } from '../../constants/visual-editor/metadata-key';

export function saveLocalDriveSettings(
  storage: SettingsStorage,
  settings: DriveSettingsDocument,
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
