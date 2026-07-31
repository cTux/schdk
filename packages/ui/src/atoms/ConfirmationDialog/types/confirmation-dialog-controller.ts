import { type ConfirmationDialogProps } from '../types';

export interface ConfirmationDialogController {
  confirm(message: string): Promise<boolean>;
  dialogProps: ConfirmationDialogProps;
}
