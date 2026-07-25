import './styles.scss';

import { Button } from '../../atoms/Button';
import { TextAreaField } from '../../atoms/TextAreaField';

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
  const hasRemark = Boolean(remark.trim());

  return (
    <div className="question-remark">
      <TextAreaField
        label="Зауваження"
        optional
        invalid={showValidation && hasRemark}
        rows={7}
        value={remark}
        onValueChange={onChange}
      />
      {hasRemark && (
        <>
          <small>Питання не готове, доки зауваження не вирішено.</small>
          <Button variant="secondary" type="button" onClick={onResolve}>
            Вирішено
          </Button>
        </>
      )}
    </div>
  );
}
