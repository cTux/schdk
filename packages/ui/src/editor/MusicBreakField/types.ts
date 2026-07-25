import type { MusicBreak } from '@schdk/common';

export interface MusicBreakFieldProps {
  musicBreak: MusicBreak | null;
  onChange(file: File | null): void;
}
