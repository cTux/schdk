import './styles.scss';

import type { AIQuestion } from '@schdk/common';
import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import type { AIQuestionsPageProps } from './types';

const EMPTY_QUESTION: AIQuestion = {
  name: '',
  description: '',
  goodExamples: '',
  badExamples: '',
};

export function AIQuestionsPage({ questions, onAdd }: AIQuestionsPageProps) {
  const { copy } = useLocalization();
  const [draft, setDraft] = useState(EMPTY_QUESTION);
  const [formOpen, setFormOpen] = useState(false);
  const [saveFailed, setSaveFailed] = useState(false);

  function updateDraft(field: keyof AIQuestion, value: string) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function closeForm() {
    setDraft(EMPTY_QUESTION);
    setSaveFailed(false);
    setFormOpen(false);
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
          <Button variant="primary" onClick={() => setFormOpen(true)}>
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
            };
            if (onAdd(question)) closeForm();
            else setSaveFailed(true);
          }}
        >
          <h2>{copy.aiQuestions.newQuestion}</h2>
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
            <article key={`${question.name}-${index}`}>
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
            </article>
          ))}
        </div>
      ) : (
        !formOpen && (
          <p className="ai-question-empty">{copy.aiQuestions.empty}</p>
        )
      )}
    </section>
  );
}
