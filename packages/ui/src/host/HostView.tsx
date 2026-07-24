import { AppIcon } from '../atoms/AppIcon';
import { StatusMessage } from '../atoms/StatusMessage';
import { PackageStart } from '../editor/PackageStart';
import type { RecentPackageItem } from '../editor/types';
import '../styles/editor.scss';
import '../styles/host.scss';
import { GameFinished } from './GameFinished';
import { GamePackageDetails } from './GamePackageDetails';
import { GameWizard } from './GameWizard';
import type { HostGameView } from './types';
import type { GameLayout } from '../options/types';

export type { RecentPackageItem } from '../editor/types';
export type {
  HostGameTransition,
  HostGameView,
  HostQuestionStage,
} from './types';

export interface HostPackageDetails {
  fileName: string;
  title: string;
  roundCount: number;
  questionCount: number;
  handoutCount: number;
}

interface HostViewProps {
  finished: boolean;
  game: HostGameView | null;
  layout: GameLayout | null;
  message: string;
  packageDetails: HostPackageDetails | null;
  recentPackages: RecentPackageItem[];
  onBack(): void;
  onGameBack(): void;
  onGameNext(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onReturnToGames(): void;
  onStartGame(): void;
}

export function HostView({
  finished,
  game,
  layout,
  message,
  packageDetails,
  recentPackages,
  onBack,
  onGameBack,
  onGameNext,
  onOpenPackage,
  onOpenRecentPackage,
  onReturnToGames,
  onStartGame,
}: HostViewProps) {
  const playing = game !== null || finished;
  return (
    <main
      id="schdk-host-app"
      className={`editor-app host-app${playing ? ' is-playing' : ''}`}
    >
      <header className="app-header" hidden={playing}>
        <div className="brand">
          <AppIcon />
          <div>
            <p className="eyebrow">Проведення гри</p>
            <h1>ЩДК Гра</h1>
          </div>
        </div>
      </header>
      <PackageStart
        hidden={packageDetails !== null || playing}
        recentPackages={recentPackages}
        onOpenPackage={onOpenPackage}
        onOpenRecentPackage={onOpenRecentPackage}
      />
      {packageDetails && !playing && (
        <GamePackageDetails
          details={packageDetails}
          onBack={onBack}
          onStart={onStartGame}
        />
      )}
      {game && (
        <GameWizard
          game={game}
          layout={layout}
          onBack={onGameBack}
          onNext={onGameNext}
        />
      )}
      {finished && <GameFinished onReturn={onReturnToGames} />}
      {message && <StatusMessage>{message}</StatusMessage>}
    </main>
  );
}
