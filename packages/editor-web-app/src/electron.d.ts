import type { SaveFilePicker } from './browser-save';

export {};

declare global {
  interface Window {
    showSaveFilePicker?: SaveFilePicker;
    desktop?: {
      saveGamePackage(
        filename: string,
        content: Uint8Array,
      ): Promise<string | null>;
      openGamePackage(
        file: File,
      ): Promise<{ filePath: string; content: Uint8Array }>;
      listRecentGamePackages(): Promise<
        Array<{ filePath: string; fileName: string }>
      >;
      openRecentGamePackage(filePath: string): Promise<{
        filePath: string;
        fileName: string;
        content: Uint8Array;
      }>;
      writeGamePackage(filePath: string, content: Uint8Array): Promise<void>;
      onCloseRequested(callback: (attempt: number) => void): () => void;
      finishCloseAttempt(attempt: number, succeeded: boolean): void;
    };
  }
}
