import type { DrivePackageStorage } from '@schdk/google-drive/game-packages';
import type {
  AiQuestionGenerationOptions,
  EditorViewProps,
} from '@schdk/ui/editor';
import type { EditorTextOptions } from '@schdk/common/app-settings';

export interface AppProps {
  aiGeneration?: AiQuestionGenerationOptions;
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  manageDocumentTitle?: boolean;
  questionDatabaseRows?: EditorViewProps['document']['questionDatabaseRows'];
  sessionScope?: string;
  textOptions?: EditorTextOptions;
  onDriveFailure?(): void;
  onExit?(): void;
}
