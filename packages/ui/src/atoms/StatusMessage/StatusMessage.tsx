import { type StatusMessageProps } from './status-message-props';

function StatusMessage({ children }: StatusMessageProps) {
  return (
    <p className="status" role="status">
      {children}
    </p>
  );
}

export { type StatusMessageProps, StatusMessage };
