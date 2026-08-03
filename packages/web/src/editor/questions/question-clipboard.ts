import { parseGameQuestion, type GameQuestion } from '@schdk/common';
import type { EditorNotice } from '@schdk/common/app-settings';
import type { LocalizationCopy } from '@schdk/ui/localization';

async function copyQuestionToClipboard(
  question: GameQuestion,
  copy: LocalizationCopy,
  notify: (notice: EditorNotice) => void,
  setMessage: (message: string) => void,
) {
  setMessage('');
  try {
    await navigator.clipboard.writeText(JSON.stringify(question, null, 2));
    notify('copied');
  } catch {
    setMessage(copy.editor.copyFailed);
  }
}

async function readQuestionFromClipboard(
  selectedIndex: number,
  confirm: (message: string) => Promise<boolean>,
  copy: LocalizationCopy,
  notify: (notice: EditorNotice) => void,
  setMessage: (message: string) => void,
) {
  if (!(await confirm(copy.editor.confirmPaste(selectedIndex + 1))))
    return null;
  setMessage('');
  try {
    const question = parseGameQuestion(
      JSON.parse(await navigator.clipboard.readText()),
    );
    notify('pasted');
    return question;
  } catch {
    setMessage(copy.editor.pasteFailed);
    return null;
  }
}

export { copyQuestionToClipboard, readQuestionFromClipboard };
