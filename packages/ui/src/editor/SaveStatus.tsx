import type { EditorSaveStatus } from './types';

const SAVE_STATUS_LABELS: Record<EditorSaveStatus, string> = {
  saved: 'Файл збережено',
  pending: 'Очікує збереження',
  saving: 'Файл зберігається…',
  error: 'Не вдалося зберегти файл',
};

interface SaveStatusProps {
  status: EditorSaveStatus;
}

export function SaveStatus({ status }: SaveStatusProps) {
  return (
    <p className={`save-status ${status}`} role="status">
      <span className="save-status-dot" aria-hidden="true" />
      {SAVE_STATUS_LABELS[status]}
    </p>
  );
}
