import type { WebDriveSettingsDocument } from '../../types/google-drive/web-drive-settings-document';

export function initializeDriveSettings(
  settings: WebDriveSettingsDocument,
): WebDriveSettingsDocument {
  const updatedAt = new Date().toISOString();
  return {
    ...settings,
    sections: {
      editorTextOptions: {
        updatedAt,
        value: settings.sections.editorTextOptions.value,
      },
      gameOptions: {
        updatedAt,
        value: settings.sections.gameOptions.value,
      },
      recentPackages: settings.sections.recentPackages,
    },
  };
}
