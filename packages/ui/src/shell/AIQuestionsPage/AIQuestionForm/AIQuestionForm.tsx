import { Button } from '../../../atoms/Button';
import { Checkbox } from '../../../atoms/Checkbox';
import { Input } from '../../../atoms/Input';
import { TextAreaField } from '../../../atoms/TextAreaField';
import type { AIQuestionFormProps } from './types';

function AIQuestionForm({
  copy,
  draft,
  editingGlobal,
  editingIndex,
  formSaving,
  isGlobalAdmin,
  onChange,
  onClose,
  onGeneralRuleChange,
  onSave,
  saveFailed,
}: AIQuestionFormProps) {
  return (
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
        await onSave(question);
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
            onChange={(event) => onGeneralRuleChange(event.target.checked)}
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
          onChange={(event) => onChange('name', event.target.value)}
        />
      </label>
      <TextAreaField
        required
        disabled={formSaving}
        rows={5}
        label={copy.aiQuestions.questionDescription}
        value={draft.description}
        onValueChange={(value) => onChange('description', value)}
      />
      <TextAreaField
        optional
        disabled={formSaving}
        optionalLabel={copy.shared.optional}
        rows={4}
        label={copy.aiQuestions.goodExamples}
        value={draft.goodExamples}
        onValueChange={(value) => onChange('goodExamples', value)}
      />
      <TextAreaField
        optional
        disabled={formSaving}
        optionalLabel={copy.shared.optional}
        rows={4}
        label={copy.aiQuestions.badExamples}
        value={draft.badExamples}
        onValueChange={(value) => onChange('badExamples', value)}
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
          onClick={onClose}
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
  );
}

export { AIQuestionForm };
