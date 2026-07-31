import './styles.scss';
import { AlertDialog } from '@base-ui/react/alert-dialog';
import { useRef } from 'react';
import { Button } from '../Button';
import { useLocalization } from '../../localization';
import type { ConfirmationDialogProps } from './types';
import { useConfirmationDialog } from './hooks/use-confirmation-dialog';

function ConfirmationDialog({
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

export { ConfirmationDialog, useConfirmationDialog };
