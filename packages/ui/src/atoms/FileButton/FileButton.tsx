import type { InputHTMLAttributes, ReactNode } from 'react';

export interface FileButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
}

export function FileButton({ children, ...props }: FileButtonProps) {
  return (
    <label className="file-button">
      {children}
      <input type="file" {...props} />
    </label>
  );
}
