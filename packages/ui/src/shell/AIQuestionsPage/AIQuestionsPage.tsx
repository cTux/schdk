import './styles.scss';

import {
  faEye,
  faEyeSlash,
  faPen,
  faStar,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons';
import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../../atoms/ConfirmationDialog';
import { IconButton } from '../../atoms/IconButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import type { AIQuestionsPageProps } from './types';

const EMPTY_QUESTION: AIQuestion = {
  name: '',
  description: '',
  goodExamples: '',
  badExamples: '',
  enabled: true,
  favorite: false,
};

export function AIQuestionsPage({
  questions,
  onAdd,
  onRemove,
  onUpdate,
}: AIQuestionsPageProps) {
  const { copy } = useLocalization();
  const deleteDialog = useConfirmationDialog();
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  function updateDraft(
    field: 'name' | 'description' | 'goodExamples' | 'badExamples',
    value: string,
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function closeForm() {
    setDraft(EMPTY_QUESTION);
    setEditingIndex(null);
    setSaveFailed(false);
    setFormOpen(false);
  }

  function editQuestion(question: AIQuestion, index: number) {
    setDraft(question);
    setEditingIndex(index);
    setSaveFailed(false);
    setFormOpen(true);
  }

  function updateQuestion(index: number, question: AIQuestion) {
    setSaveFailed(!onUpdate(index, question));
  }
  return (
    <section className="ai-questions-page">
      <header>
        <div>
          <p className="eyebrow">{copy.shell.artificialIntelligence.label}</p>
          <h1>{copy.aiQuestions.title}</h1>
          <p>{copy.aiQuestions.description}</p>
        </div>
        {!formOpen && (
          <Button
            variant="primary"
            onClick={() => {
              setDraft(EMPTY_QUESTION);
              setEditingIndex(null);
              setFormOpen(true);
            }}
          >
            {copy.aiQuestions.add}
          </Button>
        )}
      </header>
      {formOpen && (
        <form
          className="ai-question-form"
          onSubmit={(event) => {
            event.preventDefault();
            const question = {
              name: draft.name.trim(),
              description: draft.description.trim(),
              goodExamples: draft.goodExamples.trim(),
              badExamples: draft.badExamples.trim(),
              enabled: draft.enabled,
              favorite: draft.favorite,
            };
            const saved =
              editingIndex === null
                ? onAdd(question)
                : onUpdate(editingIndex, question);
            if (saved) closeForm();
            else setSaveFailed(true);
          }}
        >
          <h2>
            {editingIndex === null
              ? copy.aiQuestions.newQuestion
              : copy.aiQuestions.editQuestion}
          </h2>
          <label>
            {copy.aiQuestions.name}
            <input
              autoFocus
              required
              value={draft.name}
              onChange={(event) => updateDraft('name', event.target.value)}
            />
          </label>
          <TextAreaField
            required
            rows={5}
            label={copy.aiQuestions.questionDescription}
            value={draft.description}
            onValueChange={(value) => updateDraft('description', value)}
          />
          <TextAreaField
            optional
            optionalLabel={copy.shared.optional}
            rows={4}
            label={copy.aiQuestions.goodExamples}
            value={draft.goodExamples}
            onValueChange={(value) => updateDraft('goodExamples', value)}
          />
          <TextAreaField
            optional
            optionalLabel={copy.shared.optional}
            rows={4}
            label={copy.aiQuestions.badExamples}
            value={draft.badExamples}
            onValueChange={(value) => updateDraft('badExamples', value)}
          />
          {saveFailed && (
            <p className="ai-question-save-error" role="alert">
              {copy.aiQuestions.saveFailed}
            </p>
          )}
          <div className="ai-question-form-actions">
            <Button type="button" variant="ghost" onClick={closeForm}>
              {copy.shared.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={!draft.name.trim() || !draft.description.trim()}
            >
              {copy.aiQuestions.save}
            </Button>
          </div>
        </form>
      )}
      {questions.length ? (
        <div className="ai-question-list">
          {questions.map((question, index) => (
            <article
              key={`${question.name}-${index}`}
              data-disabled={question.enabled ? undefined : true}
            >
              <div className="ai-question-card-actions">
                <IconButton
                  icon={faPen}
                  label={copy.aiQuestions.edit}
                  onClick={() => editQuestion(question, index)}
                />
                <IconButton
                  aria-pressed={question.enabled}
                  icon={question.enabled ? faEye : faEyeSlash}
                  label={
                    question.enabled
                      ? copy.aiQuestions.disable
                      : copy.aiQuestions.enable
                  }
                  onClick={() =>
                    updateQuestion(index, {
                      ...question,
                      enabled: !question.enabled,
                    })
                  }
                />
                <IconButton
                  icon={faTrashCan}
                  label={copy.aiQuestions.delete}
                  onClick={async () => {
                    const confirmed = await deleteDialog.confirm(
                      copy.aiQuestions.deleteConfirmation(question.name),
                    );
                    if (confirmed) {
                      setSaveFailed(!onRemove(index));
                    }
                  }}
                />
                <IconButton
                  className="ai-question-favorite"
                  aria-pressed={question.favorite}
                  icon={faStar}
                  label={
                    question.favorite
                      ? copy.aiQuestions.removeFavorite
                      : copy.aiQuestions.favorite
                  }
                  onClick={() =>
                    updateQuestion(index, {
                      ...question,
                      favorite: !question.favorite,
                    })
                  }
                />
              </div>
              <div className="ai-question-card-body">
                <h2>{question.name}</h2>
                <p>{question.description}</p>
                {question.goodExamples && (
                  <section>
                    <h3>{copy.aiQuestions.goodExamples}</h3>
                    <p>{question.goodExamples}</p>
                  </section>
                )}
                {question.badExamples && (
                  <section>
                    <h3>{copy.aiQuestions.badExamples}</h3>
                    <p>{question.badExamples}</p>
                  </section>
                )}
              </div>
            </article>
          ))}
        </div>
      ) : (
        !formOpen && (
          <p className="ai-question-empty">{copy.aiQuestions.empty}</p>
        )
      )}
      {!formOpen && saveFailed && (
        <p className="ai-question-save-error" role="alert">
          {copy.aiQuestions.saveFailed}
        </p>
      )}
      <ConfirmationDialog {...deleteDialog.dialogProps} />
    </section>
  );
}
