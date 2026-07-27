import { toast } from 'react-toastify';
import type { AppLocale } from '../../localization';
import {
  editorToastCopy,
  type EditorToastAction,
} from '../../localization/editor-toast';

export function showEditorToast(action: EditorToastAction, locale: AppLocale) {
  toast.success(editorToastCopy[locale][action], { toastId: action });
}
