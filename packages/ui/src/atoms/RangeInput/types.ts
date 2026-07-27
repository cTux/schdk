import type { InputHTMLAttributes } from 'react';

export interface RangeInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type'
> {}
