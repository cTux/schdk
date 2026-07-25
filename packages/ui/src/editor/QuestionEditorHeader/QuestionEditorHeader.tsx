import './styles.scss';

import { faCopy, faPaste } from '@fortawesome/free-solid-svg-icons';
import { Button } from '../../atoms/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

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
        <Button variant="secondary" type="button" onClick={onCopy}>
          <FontAwesomeIcon icon={faCopy} aria-hidden="true" /> Копіювати
        </Button>
        <Button variant="secondary" type="button" onClick={onPaste}>
          <FontAwesomeIcon icon={faPaste} aria-hidden="true" /> Вставити
        </Button>
      </div>
    </div>
  );
}
