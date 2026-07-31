import './styles.scss';

import type { AIQuestion } from '@schdk/common';
import { useEffect, useState } from 'react';
import { useLocalization } from '../../localization';
import { AIQuestionCollection } from '../AIQuestionCollection';
import { Page } from '../Page';
import { EMPTY_QUESTION } from './constants';
import { AIQuestionForm } from './AIQuestionForm';
import type { AIQuestionsPageProps } from './types';

export function AIQuestionsPage({
  questions,
  globalQuestions,
  failed,
  globalFailed,
  loading,
  globalLoading,
  hidden,
  isGlobalAdmin,
  editTarget,
  onAdd,
  onAddGlobal,
  onBack,
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

  async function saveQuestion(question: AIQuestion) {
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
  }

  return (
    <Page
      className="ai-questions-page"
      hidden={hidden}
      title={copy.aiQuestions.title}
      headerContent={
        <>
          <p className="eyebrow">{copy.shell.artificialIntelligence.label}</p>
          <p>{copy.aiQuestions.description}</p>
        </>
      }
      onBack={onBack}
    >
      {formOpen && (
        <AIQuestionForm
          copy={copy}
          draft={draft}
          editingGlobal={editingGlobal}
          editingIndex={editingIndex}
          formSaving={formSaving}
          isGlobalAdmin={isGlobalAdmin}
          onChange={updateDraft}
          onClose={closeForm}
          onGeneralRuleChange={(generalRule) =>
            setDraft((current) => ({ ...current, generalRule }))
          }
          onSave={saveQuestion}
          saveFailed={saveFailed}
        />
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
    </Page>
  );
}
