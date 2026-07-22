export {};

declare global {
  interface Window {
    desktop?: {
      onCloseRequested(callback: (attempt: number) => void): () => void;
      finishCloseAttempt(attempt: number, succeeded: boolean): void;
    };
  }
}
