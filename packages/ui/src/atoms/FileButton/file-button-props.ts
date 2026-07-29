import type { InputHTMLAttributes, ReactNode } from 'react';

export interface FileButtonProps extends InputHTMLAttributes<HTMLInputElement> {
  children: ReactNode;
}
