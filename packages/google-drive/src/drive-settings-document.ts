import { type TimedSection } from './timed-section.js';
import { type DriveRecentPackage } from './drive-recent-package.js';

export interface DriveSettingsDocument {
  schemaVersion: 1;
  packageFolderId?: string;
  sections: {
    editorTextOptions: TimedSection;
    gameOptions: TimedSection;
    recentPackages: TimedSection<DriveRecentPackage[]>;
  };
}
