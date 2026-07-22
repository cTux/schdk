import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AppIcon } from '../atoms/AppIcon';
import { Button } from '../atoms/Button';
import type { EditorSaveStatus } from './types';

const SAVE_STATUS_LABELS: Record<EditorSaveStatus, string> = {
  saved: 'Файл збережено',
  pending: 'Очікує збереження',
  saving: 'Файл зберігається…',
  error: 'Не вдалося зберегти файл',
};

interface EditorHeaderProps {
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
  const titleInvalid = showValidation && !packageTitle.trim();

  return (
    <header className="app-header">
      <div className="brand">
        {hasPackage && (
          <Button
            className="back-button"
            variant="ghost"
            type="button"
            onClick={onBack}
            aria-label="Назад"
            title="Назад"
          >
            <FontAwesomeIcon icon={faArrowLeft} aria-hidden="true" />
          </Button>
        )}
        <AppIcon />
        <div>
          <p className="eyebrow">Редактор пакетів</p>
          <h1>Що? Де? Коли?</h1>
        </div>
      </div>
      {hasPackage && (
        <div className="package-header">
          <label className="package-title">
            Назва пакета
            <input
              className={titleInvalid ? 'invalid' : ''}
              value={packageTitle}
              onChange={(event) => onTitleChange(event.target.value)}
              placeholder="Наприклад, Весняна гра 2026"
              aria-invalid={titleInvalid}
            />
          </label>
          <p className={`save-status ${saveStatus}`} role="status">
            <span className="save-status-dot" aria-hidden="true" />
            {SAVE_STATUS_LABELS[saveStatus]}
          </p>
        </div>
      )}
    </header>
  );
}
