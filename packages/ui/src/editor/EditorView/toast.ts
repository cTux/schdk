import { toast } from 'react-toastify';
import type { AppLocale } from '../../localization';
import {
  editorToastCopy,
  type EditorToastAction,
} from '../../localization/editor-toast';

export function showEditorToast(action: EditorToastAction, locale: AppLocale) {
  const message = editorToastCopy[locale][action];
  const options = {
    autoClose: 2000,
    toastId: action,
  };

  if (toast.isActive(action)) {
    toast.update(action, { ...options, render: message });
    return;
  }
  toast.success(message, options);
}
