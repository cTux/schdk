import './styles.scss';
import classNames from 'classnames';
import { type ButtonProps } from './button-props';
import { type ButtonVariant } from './button-variant';

function Button({
  className = '',
  variant = 'default',
  ...props
}: ButtonProps) {
  return (
    <button
      className={
        classNames('ui-button', variant !== 'default' && variant, className) ||
        undefined
      }
      {...props}
    />
  );
}

export { type ButtonVariant, type ButtonProps, Button };
