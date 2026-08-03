import {
  serializeVisualEditorTemplate,
  type GamePresentationOptions,
} from '@schdk/common';

export function downloadVisualEditorTemplate(game: GamePresentationOptions) {
  const content = new Uint8Array(serializeVisualEditorTemplate(game));
  const url = URL.createObjectURL(
    new Blob([content], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = 'schdk-visual-template.schdk-template';
  link.click();
  URL.revokeObjectURL(url);
}
