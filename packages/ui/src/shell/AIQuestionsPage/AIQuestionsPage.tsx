import './styles.scss';

import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { AIQuestionCollection } from '../AIQuestionCollection';
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
  globalQuestions,
  failed,
  globalFailed,
  loading,
  globalLoading,
  isGlobalAdmin,
  onAdd,
  onAddGlobal,
  onRemove,
  onRemoveGlobal,
  onUpdate,
  onUpdateGlobal,
}: AIQuestionsPageProps) {
  const { copy } = useLocalization();
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingGlobal, setEditingGlobal] = useState(false);
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
    setEditingGlobal(false);
    setSaveFailed(false);
    setFormSaving(false);
    setFormOpen(false);
  }

  function editQuestion(question: AIQuestion, index: number, global = false) {
    setDraft(question);
    setEditingIndex(index);
    setEditingGlobal(global);
    setSaveFailed(false);
    setFormOpen(true);
  }

  function updateQuestion(index: number, question: AIQuestion, global = false) {
    setSaveFailed(false);
    return global ? onUpdateGlobal(index, question) : onUpdate(index, question);
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
              setEditingGlobal(false);
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
                ? editingGlobal
                  ? onAddGlobal(question)
                  : onAdd(question)
                : updateQuestion(editingIndex, question, editingGlobal)
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
      <AIQuestionCollection
        title={copy.aiQuestions.myQuestions}
        emptyLabel={copy.aiQuestions.empty}
        questions={questions}
        loading={loading || formOpen}
        editable
        onEdit={editQuestion}
        onRemove={onRemove}
        onSaveFailed={() => setSaveFailed(true)}
        onUpdate={updateQuestion}
      />
      <AIQuestionCollection
        title={copy.aiQuestions.globalQuestions}
        emptyLabel={copy.aiQuestions.globalEmpty}
        questions={globalQuestions}
        loading={globalLoading || formOpen}
        editable={isGlobalAdmin}
        addLabel={
          isGlobalAdmin && !formOpen ? copy.aiQuestions.addGlobal : undefined
        }
        onAdd={() => {
          setDraft(EMPTY_QUESTION);
          setEditingIndex(null);
          setEditingGlobal(true);
          setFormOpen(true);
        }}
        onEdit={(question, index) => editQuestion(question, index, true)}
        onRemove={onRemoveGlobal}
        onSaveFailed={() => setSaveFailed(true)}
        onUpdate={(index, question) => updateQuestion(index, question, true)}
      />
      {!formOpen && (failed || globalFailed || saveFailed) && (
        <p className="ai-question-save-error" role="alert">
          {copy.aiQuestions.saveFailed}
        </p>
      )}
    </section>
  );
}
