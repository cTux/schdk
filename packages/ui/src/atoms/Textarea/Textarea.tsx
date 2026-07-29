import './styles.scss';
import classNames from 'classnames';
import { type TextareaProps } from './textarea-props';

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames('ui-textarea', className) || undefined}
      {...props}
    />
  );
}

export { type TextareaProps, Textarea };
