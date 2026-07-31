import type { ReactNode } from 'react';

export interface PageProps {
  children: ReactNode;
  className?: string;
  headerContent?: ReactNode;
  hidden?: boolean;
  onBack(): void;
  title: ReactNode;
}
