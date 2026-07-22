import type { Handout } from '@schdk/common';
import { FileButton } from '../atoms/FileButton';
import { HandoutPreview } from './HandoutPreview';

interface QuestionHandoutFieldProps {
  handout?: Handout;
  onAdd(file: File): void;
  onRemove(): void;
}

export function QuestionHandoutField({
  handout,
  onAdd,
  onRemove,
}: QuestionHandoutFieldProps) {
  return (
    <fieldset>
      <legend>
        Роздатка <span>(необов'язково)</span>
      </legend>
      {handout ? (
        <HandoutPreview handout={handout} onRemove={onRemove} />
      ) : (
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
    </fieldset>
  );
}
