import { useCallback, useRef, useState } from 'react';
import type { ConfirmationDialogController } from '../types';

export function useConfirmationDialog(): ConfirmationDialogController {
  const [message, setMessage] = useState<string | null>(null);
  const [confirmLabel, setConfirmLabel] = useState<string>();
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setMessage(null);
    setConfirmLabel(undefined);
  }, []);

  const confirm = useCallback(
    (nextMessage: string, nextConfirmLabel?: string) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setMessage(nextMessage);
        setConfirmLabel(nextConfirmLabel);
      }),
    [],
  );

  return {
    confirm,
    dialogProps: {
      confirmLabel,
      message: message ?? '',
      open: message !== null,
      onClose: close,
    },
  };
}
