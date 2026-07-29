import classNames from 'classnames';
import { LOCALIZATION_COPY } from '../../localization';
import { type SaveStatusProps } from './save-status-props';

function SaveStatus({ label, status }: SaveStatusProps) {
  return (
    <p className={classNames('save-status', status)} role="status">
      <span className="save-status-dot" aria-hidden="true" />
      {label ?? LOCALIZATION_COPY.uk.editor.saveStatus[status]}
    </p>
  );
}

export { type SaveStatusProps, SaveStatus };
