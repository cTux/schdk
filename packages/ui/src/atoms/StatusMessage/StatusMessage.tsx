import './styles.scss';

export interface StatusMessageProps {
  children: string;
}

export function StatusMessage({ children }: StatusMessageProps) {
  return (
    <p className="status" role="status">
      {children}
    </p>
  );
}
