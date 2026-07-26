import './styles.scss';

import classNames from 'classnames';
import type { TextareaHTMLAttributes } from 'react';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={classNames('ui-textarea', className) || undefined}
      {...props}
    />
  );
}
