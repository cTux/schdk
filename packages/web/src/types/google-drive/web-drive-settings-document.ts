import type { GameOptions } from '@schdk/common';
import type { DriveSettingsDocument } from '@schdk/google-drive';
import type { EditorTextOptions } from '@schdk/ui/options';

export type WebDriveSettingsDocument = DriveSettingsDocument<
  EditorTextOptions,
  GameOptions
>;
