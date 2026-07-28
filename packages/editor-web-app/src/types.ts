import type { DrivePackageStorage } from '@schdk/google-drive';
import type {
  AiQuestionGenerationOptions,
  EditorViewProps,
} from '@schdk/ui/editor';
import type { EditorTextOptions } from '@schdk/ui/options';

export interface AppProps {
  aiGeneration?: AiQuestionGenerationOptions;
  drive?: DrivePackageStorage;
  driveActive?: boolean;
  manageDocumentTitle?: boolean;
  questionDatabaseRows?: EditorViewProps['questionDatabaseRows'];
  sessionScope?: string;
  textOptions?: EditorTextOptions;
  onDriveFailure?(): void;
}
