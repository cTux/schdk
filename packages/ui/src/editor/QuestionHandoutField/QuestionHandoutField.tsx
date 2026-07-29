import { Button } from '../../atoms/Button';
import { FileButton } from '../../atoms/FileButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { useLocalization } from '../../localization';
import { HandoutPreview } from '../HandoutPreview';
import { type QuestionHandoutFieldProps } from './question-handout-field-props';

function QuestionHandoutField({
  handout,
  onAdd,
  onRemove,
  onTextChange,
}: QuestionHandoutFieldProps) {
  const { copy } = useLocalization();
  const textHandout = handout?.kind === 'text' ? handout : undefined;
  return (
    <div className="question-handout-field">
      {handout && handout.kind !== 'text' ? (
        <HandoutPreview handout={handout} onRemove={onRemove} />
      ) : (
        <div className="handout-text-editor">
          <div className="handout-inputs">
            <FileButton
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAdd(file);
                event.target.value = '';
              }}
            >
              {copy.editor.addImage}
            </FileButton>
            <TextAreaField
              label={copy.editor.orEnterText}
              rows={7}
              value={textHandout?.text ?? ''}
              onValueChange={onTextChange}
            />
          </div>
          {textHandout && (
            <Button className="handout-remove" type="button" onClick={onRemove}>
              {copy.shared.remove}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export { type QuestionHandoutFieldProps, QuestionHandoutField };
