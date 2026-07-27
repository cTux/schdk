import { toast } from 'react-toastify';
import type { AppLocale } from '../../localization';
import { editorToastCopy } from '../../localization/editor-toast';

export function showQuestionActionToast(
  action: 'copied' | 'pasted',
  locale: AppLocale,
) {
  toast.success(editorToastCopy[locale][action], { toastId: action });
}
