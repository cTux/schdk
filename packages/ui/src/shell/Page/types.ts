import type { ReactNode } from 'react';

export interface PageProps {
  children: ReactNode;
  headerContent?: ReactNode;
  onBack(): void;
  title: ReactNode;
}
