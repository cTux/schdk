import { type ConfirmationDialogProps } from '../types';

export interface ConfirmationDialogController {
  confirm(message: string, confirmLabel?: string): Promise<boolean>;
  dialogProps: ConfirmationDialogProps;
}
