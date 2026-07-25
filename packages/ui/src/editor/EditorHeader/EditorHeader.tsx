import './styles.scss';

import { useLocalization } from '../../localization';
import { EditorBrand } from '../EditorBrand';
import { PackageTitleField } from '../PackageTitleField';
import { SaveStatus } from '../SaveStatus';
import type { EditorSaveStatus } from '../types';

export interface EditorHeaderProps {
  hasPackage: boolean;
  packageTitle: string;
  saveStatus: EditorSaveStatus;
  showValidation: boolean;
  onBack(): void;
  onTitleChange(value: string): void;
}

export function EditorHeader({
  hasPackage,
  packageTitle,
  saveStatus,
  showValidation,
  onBack,
  onTitleChange,
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
          <SaveStatus
            label={copy.editor.saveStatus[saveStatus]}
            status={saveStatus}
          />
        </div>
      )}
    </header>
  );
}
