import './styles.scss';

import classNames from 'classnames';
import type { EditorSaveStatus } from '../types';
import { SAVE_STATUS_LABELS } from './constants';

export interface SaveStatusProps {
  status: EditorSaveStatus;
}

export function SaveStatus({ status }: SaveStatusProps) {
  return (
    <p className={classNames('save-status', status)} role="status">
      <span className="save-status-dot" aria-hidden="true" />
      {SAVE_STATUS_LABELS[status]}
    </p>
  );
}
