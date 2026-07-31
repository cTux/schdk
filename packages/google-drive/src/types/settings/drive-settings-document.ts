import { type TimedSection } from './timed-section.js';
import { type DriveRecentPackage } from '../game-packages/drive-recent-package.js';

export interface DriveSettingsDocument<
  EditorTextOptions = unknown,
  GameOptions = unknown,
> {
  schemaVersion: 1;
  packageFolderId?: string;
  sections: {
    editorTextOptions: TimedSection<EditorTextOptions>;
    gameOptions: TimedSection<GameOptions>;
    recentPackages: TimedSection<DriveRecentPackage[]>;
  };
}
