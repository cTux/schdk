import './styles.scss';

import { Button } from '../../atoms/Button';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../../atoms/ConfirmationDialog';
import { useLocalization } from '../../localization';
import { AIQuestionCard } from '../AIQuestionCard';
import type { AIQuestionCollectionProps } from './types';

export function AIQuestionCollection({
  title,
  emptyLabel,
  questions,
  loading,
  editable,
  addLabel,
  onAdd,
  onEdit,
  onRemove,
  onUpdate,
  onSaveFailed,
}: AIQuestionCollectionProps) {
  const { copy } = useLocalization();
  const deleteDialog = useConfirmationDialog();

  return (
    <section className="ai-question-collection">
      <header>
        <h2>{title}</h2>
        {addLabel && onAdd && (
          <Button variant="primary" onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </header>
      {questions.length ? (
        <div className="ai-question-list">
          {questions.map((question, index) => (
            <AIQuestionCard
              key={`${question.name}-${index}`}
              question={question}
              onDelete={
                editable
                  ? async () => {
                      const confirmed = await deleteDialog.confirm(
                        copy.aiQuestions.deleteConfirmation(question.name),
                      );
                      return !confirmed || onRemove(index);
                    }
                  : undefined
              }
              onEdit={editable ? () => onEdit(question, index) : undefined}
              onSaveFailed={onSaveFailed}
              onUpdate={
                editable
                  ? (nextQuestion) => onUpdate(index, nextQuestion)
                  : undefined
              }
            />
          ))}
        </div>
      ) : (
        !loading && <p className="ai-question-empty">{emptyLabel}</p>
      )}
      <ConfirmationDialog {...deleteDialog.dialogProps} />
    </section>
  );
}
