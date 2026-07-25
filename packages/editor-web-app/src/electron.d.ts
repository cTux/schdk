export {};

declare global {
  interface SchdkDesktopApi {
    saveGamePackage(
      filename: string,
      content: Uint8Array,
    ): Promise<string | null>;
    setEditorPackageOpen(open: boolean): void;
    setPresenterNotes(
      notes: {
        questionNumber: number;
        questionCount: number;
        notes: string;
      } | null,
    ): void;
    onCloseRequested(callback: (attempt: number) => void): () => void;
    finishCloseAttempt(attempt: number, succeeded: boolean): void;
  }

  interface Window {
    desktop?: SchdkDesktopApi;
  }
}
