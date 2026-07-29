import { type DriveSettingsDocument } from '@schdk/google-drive';

export function initializeDriveSettings(
  settings: DriveSettingsDocument,
): DriveSettingsDocument {
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
