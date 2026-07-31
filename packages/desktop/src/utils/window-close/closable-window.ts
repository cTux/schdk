export interface ClosableWindow {
  isDestroyed(): boolean;
  destroy(): void;
  onClose(listener: (event: { preventDefault(): void }) => void): void;
  sendCloseRequested(attempt: number): boolean;
}
