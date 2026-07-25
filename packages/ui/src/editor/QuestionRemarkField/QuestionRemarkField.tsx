import './styles.scss';

import { Button } from '../../atoms/Button';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';

export interface QuestionRemarkFieldProps {
  remark: string;
  showValidation: boolean;
  onChange(remark: string): void;
  onResolve(): void;
}

export function QuestionRemarkField({
  remark,
  showValidation,
  onChange,
  onResolve,
}: QuestionRemarkFieldProps) {
  const { copy } = useLocalization();
  const hasRemark = Boolean(remark.trim());

  return (
    <div className="question-remark">
      <TextAreaField
        label={copy.editor.remark}
        optional
        optionalLabel={copy.shared.optional}
        invalid={showValidation && hasRemark}
        rows={7}
        value={remark}
        onValueChange={onChange}
      />
      {hasRemark && (
        <>
          <small>{copy.editor.unresolvedRemark}</small>
          <Button variant="secondary" type="button" onClick={onResolve}>
            {copy.editor.resolved}
          </Button>
        </>
      )}
    </div>
  );
}
