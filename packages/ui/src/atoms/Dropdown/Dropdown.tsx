import './styles.scss';

import classNames from 'classnames';
import type { SelectHTMLAttributes } from 'react';

export interface DropdownProps extends SelectHTMLAttributes<HTMLSelectElement> {}

export function Dropdown({ className, ...props }: DropdownProps) {
  return (
    <span className="ui-dropdown">
      <select
        className={classNames('ui-dropdown-select', className) || undefined}
        {...props}
      />
    </span>
  );
}
