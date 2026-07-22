export {};

declare global {
  interface Window {
    desktop?: {
      saveGamePackage(
        filename: string,
        content: Uint8Array,
      ): Promise<string | null>;
      openGamePackage(
        file: File,
      ): Promise<{ filePath: string; content: Uint8Array }>;
      writeGamePackage(filePath: string, content: Uint8Array): Promise<void>;
      onCloseRequested(callback: (attempt: number) => void): () => void;
      finishCloseAttempt(attempt: number, succeeded: boolean): void;
    };
  }
}
