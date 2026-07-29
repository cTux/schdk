import './styles.scss';
import classNames from 'classnames';
import { type DropdownProps } from './dropdown-props';

function Dropdown({ className, ...props }: DropdownProps) {
  return (
    <span className="ui-dropdown">
      <select
        className={classNames('ui-dropdown-select', className) || undefined}
        {...props}
      />
    </span>
  );
}

export { type DropdownProps, Dropdown };
