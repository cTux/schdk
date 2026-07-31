export interface PackageDropZoneProps {
  disabled?: boolean;
  hidden: boolean;
  compact?: boolean;
  onCreate?(): void;
  onOpen(file: File): void;
}
