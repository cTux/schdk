import './styles.scss';

import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useCallback, useRef, useState } from 'react';
import { Button } from '../Button';
import { useLocalization } from '../../localization';
import type {
  ConfirmationDialogController,
  ConfirmationDialogProps,
} from './types';

export function ConfirmationDialog({
  message,
  open,
  onClose,
}: ConfirmationDialogProps) {
  const { copy } = useLocalization();
  const confirmButton = useRef<HTMLButtonElement>(null);
  const portalContainer =
    document.fullscreenElement instanceof HTMLElement
      ? document.fullscreenElement
      : null;

  return (
    <AlertDialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose(false);
      }}
    >
      <AlertDialog.Portal container={portalContainer ?? undefined}>
        <AlertDialog.Backdrop className="confirmation-dialog-backdrop" />
        <AlertDialog.Viewport className="confirmation-dialog-viewport">
          <AlertDialog.Popup
            className="confirmation-dialog-popup"
            initialFocus={confirmButton}
          >
            <AlertDialog.Title className="confirmation-dialog-title">
              {copy.shared.confirmation}
            </AlertDialog.Title>
            <AlertDialog.Description className="confirmation-dialog-message">
              {message}
            </AlertDialog.Description>
            <div className="confirmation-dialog-actions">
              <AlertDialog.Close render={<Button variant="secondary" />}>
                {copy.shared.cancel}
              </AlertDialog.Close>
              <AlertDialog.Close
                ref={confirmButton}
                render={<Button variant="primary" />}
                onClick={() => onClose(true)}
              >
                {copy.shared.confirm}
              </AlertDialog.Close>
            </div>
          </AlertDialog.Popup>
        </AlertDialog.Viewport>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

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
