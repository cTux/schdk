import { useCallback, useRef, useState } from 'react';
import type { ConfirmationDialogController } from './types';

export function useConfirmationDialog(): ConfirmationDialogController {
  const [message, setMessage] = useState<string | null>(null);
  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const close = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setMessage(null);
  }, []);

  const confirm = useCallback(
    (nextMessage: string) =>
      new Promise<boolean>((resolve) => {
        resolver.current?.(false);
        resolver.current = resolve;
        setMessage(nextMessage);
      }),
    [],
  );

  return {
    confirm,
    dialogProps: {
      message: message ?? '',
      open: message !== null,
      onClose: close,
    },
  };
}
