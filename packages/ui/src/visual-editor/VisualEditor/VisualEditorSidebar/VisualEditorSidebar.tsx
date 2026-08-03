import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport';
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport';
import { faFont } from '@fortawesome/free-solid-svg-icons/faFont';
import { faImage } from '@fortawesome/free-solid-svg-icons/faImage';
import { faRotateLeft } from '@fortawesome/free-solid-svg-icons/faRotateLeft';
import { faRotateRight } from '@fortawesome/free-solid-svg-icons/faRotateRight';
import classNames from 'classnames';
import { useRef } from 'react';
import { IconButton } from '../../../atoms/IconButton';
import type { VisualEditorSidebarProps } from './types';

export function VisualEditorSidebar({
  canRedo,
  canUndo,
  copy,
  addElement,
  onExportTemplate,
  onImportTemplate,
  onRedo,
  onUndo,
}: VisualEditorSidebarProps) {
  const templateInputRef = useRef<HTMLInputElement>(null);
  const button = (
    label: string,
    icon: typeof faFont,
    onClick: () => void,
    className = 'visual-editor-add-button',
    disabled = false,
  ) => (
    <IconButton
      className={className}
      disabled={disabled}
      icon={icon}
      label={label}
      tooltipSide="right"
      type="button"
      onClick={onClick}
    />
  );

  return (
    <aside
      className="visual-editor-add-panel"
      aria-label={copy.visualEditor.addElement}
    >
      {button(copy.visualEditor.addText, faFont, () => addElement('text'))}
      {button(copy.visualEditor.addImage, faImage, () => addElement('image'))}
      {button(
        copy.visualEditor.undo,
        faRotateLeft,
        onUndo,
        'visual-editor-add-button',
        !canUndo,
      )}
      {button(
        copy.visualEditor.redo,
        faRotateRight,
        onRedo,
        'visual-editor-add-button',
        !canRedo,
      )}
      {button(
        copy.visualEditor.importTemplate,
        faFileImport,
        () => templateInputRef.current?.click(),
        classNames('visual-editor-add-button', 'visual-editor-import-button'),
      )}
      {button(copy.visualEditor.exportTemplate, faFileExport, onExportTemplate)}
      <input
        ref={templateInputRef}
        className="visual-editor-file-input"
        type="file"
        hidden
        accept=".schdk-template,application/json"
        onChange={(event) => {
          const file = event.currentTarget.files?.[0];
          event.currentTarget.value = '';
          if (file) onImportTemplate(file);
        }}
      />
    </aside>
  );
}
