import './styles.scss';

import type { Handout } from '@schdk/common';
import { Button } from '../../atoms/Button';
import { FileButton } from '../../atoms/FileButton';
import { TextAreaField } from '../../atoms/TextAreaField';
import { HandoutPreview } from '../HandoutPreview';

export interface QuestionHandoutFieldProps {
  handout?: Handout;
  onAdd(file: File): void;
  onRemove(): void;
  onTextChange(text: string): void;
}

export function QuestionHandoutField({
  handout,
  onAdd,
  onRemove,
  onTextChange,
}: QuestionHandoutFieldProps) {
  const textHandout = handout?.kind === 'text' ? handout : undefined;
  return (
    <fieldset>
      <legend>
        Роздатка <span>(необов'язково)</span>
      </legend>
      {handout && handout.kind !== 'text' ? (
        <HandoutPreview handout={handout} onRemove={onRemove} />
      ) : (
        <div className="handout-text-editor">
          {!textHandout && (
            <FileButton
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) onAdd(file);
                event.target.value = '';
              }}
            >
              Додати зображення
            </FileButton>
          )}
          <TextAreaField
            label="Або введіть текст"
            rows={4}
            value={textHandout?.text ?? ''}
            onValueChange={onTextChange}
          />
          {textHandout && (
            <Button className="handout-remove" type="button" onClick={onRemove}>
              Видалити
            </Button>
          )}
        </div>
      )}
    </fieldset>
  );
}
