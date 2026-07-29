export interface DriveGamePackageWrite {
  name: string;
  title: string;
  content: Uint8Array;
  ready: boolean;
  hasRemarks: boolean;
}
