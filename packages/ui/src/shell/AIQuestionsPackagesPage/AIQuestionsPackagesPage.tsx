import './styles.scss';

import { type AIQuestion, type AIQuestionsPackage } from '@schdk/common';
import { useEffect, useState } from 'react';
import { Button } from '../../atoms/Button';
import { Input } from '../../atoms/Input';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { AIQuestionCollection } from '../AIQuestionCollection';
import { AIQuestionsPackageContexts } from './AIQuestionsPackageContexts';
import type { AIQuestionsPackagesPageProps } from './types';

const EMPTY_PACKAGE: AIQuestionsPackage = {
  name: '',
  context: '',
  questions: [],
  enabled: true,
  favorite: false,
};

const asQuestion = (item: AIQuestionsPackage): AIQuestion => ({
  name: item.name,
  description: item.context,
  goodExamples: '',
  badExamples: '',
  enabled: item.enabled,
  favorite: item.favorite,
  generalRule: false,
});

export function AIQuestionsPackagesPage({
  packages,
  questionRules,
  failed,
  loading,
  editTarget,
  onAdd,
  onCloseEditor,
  onRemove,
  onShowEditor,
  onUpdate,
}: AIQuestionsPackagesPageProps) {
  const { copy } = useLocalization();
  const [draft, setDraft] = useState(EMPTY_PACKAGE);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  useEffect(() => {
    if (!editTarget) {
      setEditingIndex(null);
      setFormOpen(false);
      return;
    }
    const index = packages.findIndex(({ name }) => name === editTarget.name);
    if (index < 0) return;
    setDraft(packages[index]!);
    setEditingIndex(index);
    setSaveFailed(false);
    setFormOpen(true);
  }, [editTarget, packages]);

  function closeForm() {
    const wasEditing = editingIndex !== null;
    setDraft(EMPTY_PACKAGE);
    setEditingIndex(null);
    setSaving(false);
    setSaveFailed(false);
    setFormOpen(false);
    if (wasEditing) onCloseEditor();
  }

  function openForm(item = EMPTY_PACKAGE, index: number | null = null) {
    setDraft(item);
    setEditingIndex(index);
    setSaveFailed(false);
    setFormOpen(true);
  }

  async function save() {
    const item = {
      ...draft,
      name: draft.name.trim(),
      context: draft.context.trim(),
      questions: draft.questions.map((question) => ({
        ...question,
        context: question.context.trim(),
      })),
    };
    setSaving(true);
    const saved = await (
      editingIndex === null ? onAdd(item) : onUpdate(editingIndex, item)
    ).catch(() => false);
    setSaving(false);
    if (saved) closeForm();
    else setSaveFailed(true);
  }

  return (
    <section className="ai-questions-page">
      <header>
        <div>
          <p className="eyebrow">{copy.aiPackageRules.navigationLabel}</p>
          <h1>{copy.aiPackageRules.title}</h1>
          <p>{copy.aiPackageRules.description}</p>
        </div>
      </header>
      {formOpen && (
        <form
          className="ai-question-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (!saving) void save();
          }}
        >
          <h2 className="ai-question-form-title">
            {editingIndex === null
              ? copy.aiPackageRules.newRule
              : copy.aiPackageRules.editRule}
          </h2>
          <label>
            {copy.aiPackageRules.name}
            <Input
              autoFocus
              required
              disabled={saving}
              value={draft.name}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
            />
          </label>
          <TextAreaField
            required
            disabled={saving}
            rows={6}
            label={copy.aiPackageRules.context}
            placeholder={copy.aiPackageRules.contextPlaceholder}
            value={draft.context}
            onValueChange={(context) =>
              setDraft((current) => ({ ...current, context }))
            }
          />
          <AIQuestionsPackageContexts
            disabled={saving}
            questionRules={questionRules}
            value={draft.questions}
            onChange={(questions) =>
              setDraft((current) => ({ ...current, questions }))
            }
          />
          {saveFailed && (
            <p className="ai-question-save-error" role="alert">
              {copy.aiPackageRules.saveFailed}
            </p>
          )}
          <div className="ai-question-form-actions">
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={closeForm}
            >
              {copy.shared.cancel}
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={
                saving ||
                !draft.name.trim() ||
                !draft.context.trim() ||
                draft.questions.some((question) => !question.context.trim())
              }
            >
              {copy.aiPackageRules.save}
            </Button>
          </div>
        </form>
      )}
      {editingIndex === null && (
        <AIQuestionCollection
          title={copy.aiPackageRules.myRules}
          emptyLabel={copy.aiPackageRules.empty}
          questions={packages.map(asQuestion)}
          loading={loading || formOpen}
          editable
          addLabel={!formOpen ? copy.aiPackageRules.add : undefined}
          onAdd={() => openForm()}
          onEdit={(_, index) =>
            onShowEditor({ kind: 'package', name: packages[index]!.name })
          }
          onRemove={onRemove}
          onSaveFailed={() => setSaveFailed(true)}
          onUpdate={(index, question) =>
            onUpdate(index, {
              ...packages[index]!,
              enabled: question.enabled,
              favorite: question.favorite,
            })
          }
        />
      )}
      {!formOpen && (failed || saveFailed) && (
        <p className="ai-question-save-error" role="alert">
          {copy.aiPackageRules.saveFailed}
        </p>
      )}
    </section>
  );
}
