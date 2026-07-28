import { faTrashCan } from '@fortawesome/free-solid-svg-icons';
import type { GamePackage, GameQuestion } from '@schdk/common';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { EditorBrand } from '../EditorBrand';
import type { AiQuestionGenerationOptions, EditorSaveStatus } from '../types';
import { PackageGenerationDialog } from '../PackageGenerationDialog';
import { PackageTitleField } from '../PackageTitleField';
import { SaveStatus } from '../SaveStatus';

export interface EditorHeaderProps {
  hasPackage: boolean;
  packageTitle: string;
  saveStatus: EditorSaveStatus;
  showValidation: boolean;
  onBack(): void;
  onDeletePackage(): void;
  onTitleChange(value: string): void;
  aiGeneration?: AiQuestionGenerationOptions;
  gamePackage: GamePackage;
  onQuestionGenerated(index: number, question: GameQuestion): void;
  onSelectQuestion(index: number): void;
}

export function EditorHeader({
  hasPackage,
  packageTitle,
  saveStatus,
  showValidation,
  onBack,
  onDeletePackage,
  onTitleChange,
  aiGeneration,
  gamePackage,
  onQuestionGenerated,
  onSelectQuestion,
}: EditorHeaderProps) {
  const { copy } = useLocalization();

  return (
    <header className="app-header">
      <EditorBrand showBackButton={hasPackage} onBack={onBack} />
      {hasPackage && (
        <div className="package-header">
          <PackageTitleField
            invalid={showValidation && !packageTitle.trim()}
            value={packageTitle}
            onChange={onTitleChange}
          />
          {aiGeneration && (
            <PackageGenerationDialog
              {...aiGeneration}
              gamePackage={gamePackage}
              onGenerated={onQuestionGenerated}
              onSelectQuestion={onSelectQuestion}
            />
          )}
          <IconButton
            icon={faTrashCan}
            label={copy.shared.deletePackage}
            onClick={onDeletePackage}
            variant="danger"
          />
          <SaveStatus
            label={copy.editor.saveStatus[saveStatus]}
            status={saveStatus}
          />
        </div>
      )}
    </header>
  );
}
