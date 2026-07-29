export interface PackageDropZoneProps {
  disabled?: boolean;
  hidden: boolean;
  onCreate?(): void;
  onOpen(file: File): void;
}
