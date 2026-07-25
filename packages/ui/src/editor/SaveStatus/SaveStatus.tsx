import classNames from 'classnames';
import { LOCALIZATION_COPY } from '../../localization';
import type { EditorSaveStatus } from '../types';

export interface SaveStatusProps {
  label?: string;
  status: EditorSaveStatus;
}

export function SaveStatus({ label, status }: SaveStatusProps) {
  return (
    <p className={classNames('save-status', status)} role="status">
      <span className="save-status-dot" aria-hidden="true" />
      {label ?? LOCALIZATION_COPY.uk.editor.saveStatus[status]}
    </p>
  );
}
