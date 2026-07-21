export {};

declare global {
  interface Window {
    desktop?: {
      openGamePackage(): Promise<string | null>;
      saveGamePackage(filename: string, content: string): Promise<boolean>;
    };
  }
}
