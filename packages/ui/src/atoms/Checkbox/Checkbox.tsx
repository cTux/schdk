import './styles.scss';

import classNames from 'classnames';
import type { CheckboxProps } from './types';

export function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      {...props}
      type="checkbox"
      className={classNames('ui-checkbox', className) || undefined}
    />
  );
}
