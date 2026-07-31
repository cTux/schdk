import type { ReactNode } from 'react';

export interface PageProps {
  children: ReactNode;
  className?: string;
  headerActions?: ReactNode;
  headerContent?: ReactNode;
  hidden?: boolean;
  onBack?(): void;
  title: ReactNode;
}
