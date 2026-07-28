import { faCopy, faPaste, faTrashCan } from '@fortawesome/free-solid-svg-icons';
import type { GameQuestion } from '@schdk/common';
import { IconButton } from '../../atoms/IconButton';
import { useLocalization } from '../../localization';
import { QuestionGenerationDialog } from '../QuestionGenerationDialog';
import type { AiQuestionGenerationOptions } from '../types';

export interface QuestionEditorHeaderProps {
  aiGeneration?: AiQuestionGenerationOptions;
  questionNumber: number;
  onGenerated(question: GameQuestion): void;
  onClear(): void;
  onCopy(): void;
  onPaste(): void;
}

export function QuestionEditorHeader({
  aiGeneration,
  questionNumber,
  onGenerated,
  onClear,
  onCopy,
  onPaste,
}: QuestionEditorHeaderProps) {
  const { copy } = useLocalization();

  return (
    <div className="question-heading">
      <h2>{copy.shared.questionNumber(questionNumber)}</h2>
      <div className="question-clipboard-actions">
        {aiGeneration && (
          <QuestionGenerationDialog
            {...aiGeneration}
            onGenerated={onGenerated}
          />
        )}
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
        <IconButton
          icon={faTrashCan}
          label={copy.shared.remove}
          onClick={onClear}
          variant="danger"
        />
      </div>
    </div>
  );
}
