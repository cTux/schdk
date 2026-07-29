import type { Handout } from '@schdk/common';

export interface QuestionHandoutFieldProps {
  handout?: Handout;
  onAdd(file: File): void;
  onRemove(): void;
  onTextChange(text: string): void;
}
