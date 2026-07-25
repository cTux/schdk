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
      openHostGamePackage(
        file: File,
      ): Promise<{ filePath: string; content: Uint8Array }>;
      listRecentGamePackages(): Promise<
        Array<{
          filePath: string;
          fileName: string;
          content: Uint8Array;
        }>
      >;
      openRecentGamePackage(filePath: string): Promise<{
        filePath: string;
        fileName: string;
        content: Uint8Array;
      }>;
      openRecentHostGamePackage(filePath: string): Promise<{
        filePath: string;
        fileName: string;
        content: Uint8Array;
      }>;
      writeGamePackage(filePath: string, content: Uint8Array): Promise<void>;
      setPresenterNotes(
        notes: {
          questionNumber: number;
          questionCount: number;
          notes: string;
        } | null,
      ): void;
      onCloseRequested(callback: (attempt: number) => void): () => void;
      finishCloseAttempt(attempt: number, succeeded: boolean): void;
    };
  }
}
