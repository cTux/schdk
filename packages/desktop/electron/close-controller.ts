export interface CloseController {
  finished(attempt: number, succeeded: boolean): void;
  retry(): void;
  discard(): void;
  cancel(): void;
}
