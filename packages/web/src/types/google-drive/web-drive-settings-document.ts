import type { GameOptions } from '@schdk/common/game-options';
import type { DriveSettingsDocument } from '@schdk/google-drive';
import type { EditorTextOptions } from '@schdk/common/app-settings';

export type WebDriveSettingsDocument = DriveSettingsDocument<
  EditorTextOptions,
  GameOptions
>;
