import { AppIcon } from '../atoms/AppIcon';
import { StatusMessage } from '../atoms/StatusMessage';
import { PackageStart } from '../editor/PackageStart';
import type { RecentPackageItem } from '../editor/types';
import '../styles/editor.scss';
import '../styles/host.scss';
import { GamePackageDetails } from './GamePackageDetails';

export type { RecentPackageItem } from '../editor/types';

export interface HostPackageDetails {
  fileName: string;
  title: string;
  roundCount: number;
  questionCount: number;
  handoutCount: number;
}

interface HostViewProps {
  gameStarted: boolean;
  message: string;
  packageDetails: HostPackageDetails | null;
  recentPackages: RecentPackageItem[];
  onBack(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onStartGame(): void;
}

export function HostView({
  gameStarted,
  message,
  packageDetails,
  recentPackages,
  onBack,
  onOpenPackage,
  onOpenRecentPackage,
  onStartGame,
}: HostViewProps) {
  return (
    <main className="editor-app host-app">
      <header className="app-header">
        <div className="brand">
          <AppIcon />
          <div>
            <p className="eyebrow">Проведення гри</p>
            <h1>ЩДК Гра</h1>
          </div>
        </div>
      </header>
      <PackageStart
        hidden={packageDetails !== null}
        recentPackages={recentPackages}
        onOpenPackage={onOpenPackage}
        onOpenRecentPackage={onOpenRecentPackage}
      />
      {packageDetails && (
        <GamePackageDetails
          details={packageDetails}
          gameStarted={gameStarted}
          onBack={onBack}
          onStart={onStartGame}
        />
      )}
      {message && <StatusMessage>{message}</StatusMessage>}
    </main>
  );
}
