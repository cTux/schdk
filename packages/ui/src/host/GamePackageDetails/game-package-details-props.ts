import type { HostPackageDetails } from '../HostView';

export interface GamePackageDetailsProps {
  details: HostPackageDetails;
  onBack(): void;
  onStart(): void;
}
