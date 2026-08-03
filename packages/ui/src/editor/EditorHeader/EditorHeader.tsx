import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { PackageGenerationDialog } from '../PackageGenerationDialog';
import { PackageTitleField } from '../PackageTitleField';
import { SaveStatus } from '../SaveStatus';
import { type EditorHeaderProps } from './editor-header-props';

function EditorHeader({
  hasPackage,
  packageTitle,
  saveStatus,
  showValidation,
  onDeletePackage,
  onTitleChange,
  aiGeneration,
  gamePackage,
  onQuestionGenerated,
  onPackageGenerationStateChange,
  onSelectQuestion,
}: EditorHeaderProps) {
  const { copy } = useLocalization();

  if (!hasPackage) return null;

  return (
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
          onGenerationStateChange={onPackageGenerationStateChange}
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
  );
}

export { type EditorHeaderProps, EditorHeader };
