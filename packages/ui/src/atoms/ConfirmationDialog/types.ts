export interface ConfirmationDialogProps {
  message: string;
  open: boolean;
  onClose(confirmed: boolean): void;
}

export interface ConfirmationDialogController {
  confirm(message: string): Promise<boolean>;
  dialogProps: ConfirmationDialogProps;
}
