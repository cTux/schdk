import './styles.scss';

import type { AIQuestion } from '@schdk/common';
import { useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Checkbox } from '../../atoms/Checkbox';
import { Input } from '../../atoms/Input';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { AIQuestionCollection } from '../AIQuestionCollection';
import { EMPTY_QUESTION } from './constants';
import type { AIQuestionsPageProps } from './types';

export function AIQuestionsPage({
  questions,
  globalQuestions,
  failed,
  globalFailed,
  loading,
  globalLoading,
  isGlobalAdmin,
  editTarget,
  onAdd,
  onAddGlobal,
  onRemove,
  onRemoveGlobal,
  onCloseEditor,
  onShowEditor,
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

  useEffect(() => {
    if (!editTarget) {
      setEditingIndex(null);
      setEditingGlobal(false);
      setFormOpen(false);
      return;
    }
    if (editTarget.global && !isGlobalAdmin) return;
    const source = editTarget.global ? globalQuestions : questions;
    const index = source.findIndex(({ name }) => name === editTarget.name);
    if (index < 0) return;
    setDraft(source[index]!);
    setEditingIndex(index);
    setEditingGlobal(editTarget.global);
    setSaveFailed(false);
    setFormOpen(true);
  }, [editTarget, globalQuestions, isGlobalAdmin, questions]);

  function updateDraft(
    field: 'name' | 'description' | 'goodExamples' | 'badExamples',
    value: string,
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function closeForm() {
    const wasEditing = editingIndex !== null;
    setDraft(EMPTY_QUESTION);
    setEditingIndex(null);
    setEditingGlobal(false);
    setSaveFailed(false);
    setFormSaving(false);
    setFormOpen(false);
    if (wasEditing) onCloseEditor();
  }

  function updateQuestion(index: number, question: AIQuestion, global = false) {
    setSaveFailed(false);
    return global ? onUpdateGlobal(index, question) : onUpdate(index, question);
  }

  function showEditor(question: AIQuestion, global = false) {
    onShowEditor({ kind: 'question', global, name: question.name });
  }
  return (
    <section className="ai-questions-page">
      <header>
        <div>
          <p className="eyebrow">{copy.shell.artificialIntelligence.label}</p>
          <h1>{copy.aiQuestions.title}</h1>
          <p>{copy.aiQuestions.description}</p>
        </div>
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
              generalRule: editingGlobal && draft.generalRule,
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
          <div className="ai-question-form-title">
            <h2>
              {editingIndex === null
                ? copy.aiQuestions.newQuestion
                : copy.aiQuestions.editQuestion}
            </h2>
          </div>
          {editingGlobal && isGlobalAdmin && (
            <label className="ai-question-general-rule">
              <span>{copy.aiQuestions.generalRule}</span>
              <Checkbox
                checked={draft.generalRule}
                disabled={formSaving}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    generalRule: event.target.checked,
                  }))
                }
              />
            </label>
          )}
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
      {editingIndex === null && (
        <>
          <AIQuestionCollection
            title={copy.aiQuestions.myQuestions}
            emptyLabel={copy.aiQuestions.empty}
            questions={questions}
            loading={loading || formOpen}
            editable
            addLabel={!formOpen ? copy.aiQuestions.add : undefined}
            onAdd={() => {
              setDraft(EMPTY_QUESTION);
              setEditingGlobal(false);
              setFormOpen(true);
            }}
            onEdit={(question) => showEditor(question)}
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
              isGlobalAdmin && !formOpen
                ? copy.aiQuestions.addGlobal
                : undefined
            }
            onAdd={() => {
              setDraft(EMPTY_QUESTION);
              setEditingGlobal(true);
              setFormOpen(true);
            }}
            onEdit={(question) => showEditor(question, true)}
            onRemove={onRemoveGlobal}
            onSaveFailed={() => setSaveFailed(true)}
            onUpdate={(index, question) =>
              updateQuestion(index, question, true)
            }
          />
        </>
      )}
      {!formOpen && (failed || globalFailed || saveFailed) && (
        <p className="ai-question-save-error" role="alert">
          {copy.aiQuestions.saveFailed}
        </p>
      )}
    </section>
  );
}
