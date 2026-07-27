import './styles.scss';

import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import {
  ConfirmationDialog,
  useConfirmationDialog,
} from '../../atoms/ConfirmationDialog';
import { Input } from '../../atoms/Input';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { AIQuestionCard } from '../AIQuestionCard';
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
  failed,
  loading,
  onAdd,
  onRemove,
  onUpdate,
}: AIQuestionsPageProps) {
  const { copy } = useLocalization();
  const deleteDialog = useConfirmationDialog();
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
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
    setFormSaving(false);
    setFormOpen(false);
  }

  function editQuestion(question: AIQuestion, index: number) {
    setDraft(question);
    setEditingIndex(index);
    setSaveFailed(false);
    setFormOpen(true);
  }

  function updateQuestion(index: number, question: AIQuestion) {
    setSaveFailed(false);
    return onUpdate(index, question);
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
          onSubmit={async (event) => {
            event.preventDefault();
            if (formSaving) return;
            const question = {
              name: draft.name.trim(),
              description: draft.description.trim(),
              goodExamples: draft.goodExamples.trim(),
              badExamples: draft.badExamples.trim(),
              enabled: draft.enabled,
              favorite: draft.favorite,
            };
            setFormSaving(true);
            const saved = await (
              editingIndex === null
                ? onAdd(question)
                : onUpdate(editingIndex, question)
            ).catch(() => false);
            setFormSaving(false);
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
            <Input
              autoFocus
              disabled={formSaving}
              required
              value={draft.name}
              onChange={(event) => updateDraft('name', event.target.value)}
            />
          </label>
          <TextAreaField
            required
            disabled={formSaving}
            rows={5}
            label={copy.aiQuestions.questionDescription}
            value={draft.description}
            onValueChange={(value) => updateDraft('description', value)}
          />
          <TextAreaField
            optional
            disabled={formSaving}
            optionalLabel={copy.shared.optional}
            rows={4}
            label={copy.aiQuestions.goodExamples}
            value={draft.goodExamples}
            onValueChange={(value) => updateDraft('goodExamples', value)}
          />
          <TextAreaField
            optional
            disabled={formSaving}
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
            <Button
              type="button"
              variant="ghost"
              disabled={formSaving}
              onClick={closeForm}
            >
              {copy.shared.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                formSaving || !draft.name.trim() || !draft.description.trim()
              }
            >
              {copy.aiQuestions.save}
            </Button>
          </div>
        </form>
      )}
      {questions.length ? (
        <div className="ai-question-list">
          {questions.map((question, index) => (
            <AIQuestionCard
              key={`${question.name}-${index}`}
              question={question}
              onDelete={async () => {
                const confirmed = await deleteDialog.confirm(
                  copy.aiQuestions.deleteConfirmation(question.name),
                );
                return !confirmed || onRemove(index);
              }}
              onEdit={() => editQuestion(question, index)}
              onSaveFailed={() => setSaveFailed(true)}
              onUpdate={(nextQuestion) => updateQuestion(index, nextQuestion)}
            />
          ))}
        </div>
      ) : (
        !formOpen &&
        !loading && (
          <p className="ai-question-empty">{copy.aiQuestions.empty}</p>
        )
      )}
      {!formOpen && (failed || saveFailed) && (
        <p className="ai-question-save-error" role="alert">
          {copy.aiQuestions.saveFailed}
        </p>
      )}
      <ConfirmationDialog {...deleteDialog.dialogProps} />
    </section>
  );
}
