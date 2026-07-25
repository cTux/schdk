import './styles.scss';

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { AppIcon } from '../../atoms/AppIcon';
import { IconButton } from '../../atoms/IconButton';

export interface EditorBrandProps {
  showBackButton: boolean;
  onBack(): void;
}

export function EditorBrand({ showBackButton, onBack }: EditorBrandProps) {
  return (
    <div className="brand">
      {showBackButton && (
        <IconButton
          className="back-button"
          variant="ghost"
          icon={faArrowLeft}
          label="Назад"
          onClick={onBack}
        />
      )}
      <AppIcon />
      <div>
        <p className="eyebrow">Редактор пакетів</p>
        <h1>Що? Де? Коли?</h1>
      </div>
    </div>
  );
}
