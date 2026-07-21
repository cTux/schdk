export {};

declare global {
  interface Window {
    desktop?: {
      saveGamePackage(filename: string, content: string): Promise<boolean>;
    };
  }
}
