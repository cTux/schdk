import {
  faFileExport,
  faFileImport,
  faFont,
  faImage,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useRef } from 'react';
import { Tooltip } from '../../../atoms/Tooltip';
import type { VisualEditorSidebarProps } from './types';

export function VisualEditorSidebar({
  copy,
  addElement,
  onExportTemplate,
  onImportTemplate,
}: VisualEditorSidebarProps) {
  const templateInputRef = useRef<HTMLInputElement>(null);
  const button = (
    label: string,
    icon: typeof faFont,
    onClick: () => void,
    className = 'visual-editor-add-button',
  ) => (
    <Tooltip
      label={label}
      side="right"
      trigger={
        <button
          className={className}
          type="button"
          aria-label={label}
          onClick={onClick}
        >
          <FontAwesomeIcon icon={icon} aria-hidden="true" />
        </button>
      }
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
