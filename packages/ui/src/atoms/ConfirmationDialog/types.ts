import { type ConfirmationDialogController } from './types/confirmation-dialog-controller';

interface ConfirmationDialogProps {
  message: string;
  open: boolean;
  onClose(confirmed: boolean): void;
}

export { type ConfirmationDialogProps, type ConfirmationDialogController };
