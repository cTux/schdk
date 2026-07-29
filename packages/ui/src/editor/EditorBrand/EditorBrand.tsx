import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AppIcon } from '../../atoms/AppIcon';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { type EditorBrandProps } from './editor-brand-props';

function EditorBrand({ showBackButton, onBack }: EditorBrandProps) {
  const { copy } = useLocalization();

  return (
    <div className="brand">
      {showBackButton && (
        <IconButton
          className="back-button"
          variant="ghost"
          icon={faArrowLeft}
          label={copy.shared.back}
          onClick={onBack}
        />
      )}
      <AppIcon />
      <div>
        <p className="eyebrow">{copy.editor.brandEyebrow}</p>
        <h1>{copy.editor.brandTitle}</h1>
      </div>
    </div>
  );
}

export { type EditorBrandProps, EditorBrand };
