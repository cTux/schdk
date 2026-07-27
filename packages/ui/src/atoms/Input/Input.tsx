import './styles.scss';

import classNames from 'classnames';
import type { InputProps } from './types';

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={classNames('ui-input', className) || undefined}
      {...props}
    />
  );
}
