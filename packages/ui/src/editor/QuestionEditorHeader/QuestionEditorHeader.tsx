import { faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';

export interface QuestionEditorHeaderProps {
  questionNumber: number;
  onCopy(): void;
  onPaste(): void;
}

export function QuestionEditorHeader({
  questionNumber,
  onCopy,
  onPaste,
}: QuestionEditorHeaderProps) {
  const { copy } = useLocalization();

  return (
    <div className="question-heading">
      <h2>{copy.shared.questionNumber(questionNumber)}</h2>
      <div className="question-clipboard-actions">
        <IconButton
          icon={faCopy}
          label={copy.editor.copyQuestion}
          onClick={onCopy}
        />
        <IconButton
          icon={faPaste}
          label={copy.editor.pasteQuestion}
          onClick={onPaste}
        />
      </div>
    </div>
  );
}
