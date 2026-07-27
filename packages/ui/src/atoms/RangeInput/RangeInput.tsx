import './styles.scss';

import classNames from 'classnames';
import type { RangeInputProps } from './types';

export function RangeInput({ className, ...props }: RangeInputProps) {
  return (
    <input
      type="range"
      className={classNames('ui-range-input', className) || undefined}
      {...props}
    />
  );
}
