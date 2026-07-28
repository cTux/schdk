import './styles.scss';

import { Button } from '../../atoms/Button';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../../atoms/ConfirmationDialog';
import { useLocalization } from '../../localization';
import { AIQuestionCard } from '../AIQuestionCard';
import classNames from 'classnames';
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
    <section className="ai-question-collection" aria-busy={loading}>
      <header>
        <h2>{title}</h2>
        {addLabel && onAdd && (
          <Button variant="primary" onClick={onAdd}>
            {addLabel}
          </Button>
        )}
      </header>
      {loading ? (
        <div className="ai-question-list">
          {Array.from({ length: 2 }, (_, index) => (
            <div
              className={classNames('ai-question-card', 'ai-question-skeleton')}
              aria-hidden="true"
              key={index}
            >
              <span className="ai-question-skeleton-title" />
              <span className="ai-question-skeleton-line" />
              <span
                className={classNames(
                  'ai-question-skeleton-line',
                  'ai-question-skeleton-line-short',
                )}
              />
              <span className="ai-question-skeleton-actions" />
            </div>
          ))}
        </div>
      ) : questions.length ? (
        <div className="ai-question-list">
          {questions
            .map((question, index) => ({ question, index }))
            .sort((left, right) =>
              left.question.name.localeCompare(right.question.name),
            )
            .map(({ question, index }) => (
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
        <p className="ai-question-empty">{emptyLabel}</p>
      )}
      <ConfirmationDialog {...deleteDialog.dialogProps} />
    </section>
  );
}
