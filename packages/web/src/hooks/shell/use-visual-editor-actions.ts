import type { GameOptions } from '@schdk/common';
import { useState } from 'react';
import {
  parseVisualEditorTemplateFile,
  serializeVisualEditorTemplate,
} from '../../storage/options/options-storage';

export function useVisualEditorActions(
  game: GameOptions,
  onChange: (game: GameOptions) => void,
  syncFailed: boolean,
  messages: { importFailed: string; exportFailed: string; saveFailed: string },
) {
  const [actionError, setActionError] = useState('');
  function change(value: GameOptions) {
    setActionError('');
    onChange(value);
  }
  async function importTemplate(file: File) {
    try {
      const imported = await parseVisualEditorTemplateFile(file, game);
      if (imported) return change(imported);
    } catch {
      // Use the same actionable message for file read and validation failures.
    }
    setActionError(messages.importFailed);
  }
  function exportTemplate() {
    try {
      const content = new Uint8Array(serializeVisualEditorTemplate(game));
      const url = URL.createObjectURL(
        new Blob([content], { type: 'application/zip' }),
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = 'schdk-visual-template.schdk-template';
      link.click();
      URL.revokeObjectURL(url);
      setActionError('');
    } catch {
      setActionError(messages.exportFailed);
    }
  }
  return {
    change,
    importTemplate,
    exportTemplate,
    error: actionError || (syncFailed ? messages.saveFailed : ''),
  };
}
