import { useLocalization } from '../../localization';
import { EditorBrand } from '../EditorBrand';
import { PackageTitleField } from '../PackageTitleField';
import { SaveStatus } from '../SaveStatus';
import { PackageGenerationDialog } from '../PackageGenerationDialog';
import type { GamePackage, GameQuestion } from '@schdk/common';
import type { AiQuestionGenerationOptions, EditorSaveStatus } from '../types';

export interface EditorHeaderProps {
  hasPackage: boolean;
  packageTitle: string;
  saveStatus: EditorSaveStatus;
  showValidation: boolean;
  onBack(): void;
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
          <div className="package-title-row">
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
          </div>
          <SaveStatus
            label={copy.editor.saveStatus[saveStatus]}
            status={saveStatus}
          />
        </div>
      )}
    </header>
  );
}
