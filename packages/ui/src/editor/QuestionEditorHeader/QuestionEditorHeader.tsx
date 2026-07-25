import './styles.scss';

import { faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';
import { IconButton } from '../../atoms/IconButton';

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
  return (
    <div className="question-heading">
      <h2>Питання {questionNumber}</h2>
      <div className="question-clipboard-actions">
        <IconButton icon={faCopy} label="Копіювати питання" onClick={onCopy} />
        <IconButton icon={faPaste} label="Вставити питання" onClick={onPaste} />
      </div>
    </div>
  );
}
