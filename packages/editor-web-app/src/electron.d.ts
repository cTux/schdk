export {};

declare global {
  interface Window {
    desktop?: {
      saveGamePackage(
        filename: string,
        content: string,
      ): Promise<string | null>;
      openGamePackage(
        file: File,
      ): Promise<{ filePath: string; content: string }>;
      writeGamePackage(filePath: string, content: string): Promise<void>;
      onCloseRequested(callback: () => void): () => void;
      closeWindow(): void;
    };
  }
}
