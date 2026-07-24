import type { EditorSaveStatus } from '../types';

export const SAVE_STATUS_LABELS: Record<EditorSaveStatus, string> = {
  saved: 'Файл збережено',
  pending: 'Очікує збереження',
  saving: 'Файл зберігається…',
  error: 'Не вдалося зберегти файл',
};
