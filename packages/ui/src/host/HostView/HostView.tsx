import './styles.scss';

import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { AppIcon } from '../../atoms/AppIcon';
import { StatusMessage } from '../../atoms/StatusMessage';
import { PackageStart } from '../../editor/PackageStart';
import type { RecentPackageItem } from '../../editor/types';
import { LOCALIZATION_COPY, type LocalizationCopy } from '../../localization';
import { GameFinished } from '../GameFinished';
import { GamePackageDetails } from '../GamePackageDetails';
import { GameWizard } from '../GameWizard';
import type { HostGameView } from '../types';
import type { CustomGameElement, GameLayout } from '../../options/types';

export type { RecentPackageItem } from '../../editor/types';
export type {
  HostGameTransition,
  HostGameView,
  HostQuestionStage,
} from '../types';

export interface HostPackageDetails {
  fileName: string;
  title: string;
  roundCount: number;
  questionCount: number;
  handoutCount: number;
}

export interface HostViewProps {
  backgroundImage: string | null;
  backgroundOpacity: number;
  copy?: LocalizationCopy;
  customElements?: CustomGameElement[];
  finished: boolean;
  game: HostGameView | null;
  layout: GameLayout | null;
  message: string;
  openingRecentPackageId?: string | null;
  packageDetails: HostPackageDetails | null;
  recentPackages: RecentPackageItem[];
  recentPackagesLoading?: boolean;
  onBack(): void;
  onDownloadRecentPackage?(recent: RecentPackageItem): void;
  onGameBack(): void;
  onGameNext(): void;
  onOpenPackage(file: File): void;
  onOpenRecentPackage(recent: RecentPackageItem): void;
  onReturnToGames(): void;
  onStartGame(): void;
}

export function HostView({
  backgroundImage,
  backgroundOpacity,
  copy = LOCALIZATION_COPY.uk,
  customElements = [],
  finished,
  game,
  layout,
  message,
  openingRecentPackageId = null,
  packageDetails,
  recentPackages,
  recentPackagesLoading = false,
  onBack,
  onDownloadRecentPackage,
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
      className={classNames('editor-app', 'host-app', {
        'is-playing': playing,
      })}
      style={
        {
          '--game-surface-background-image': backgroundImage
            ? `url(${JSON.stringify(backgroundImage)})`
            : 'none',
          '--game-surface-background-opacity': backgroundOpacity,
        } as CSSProperties
      }
    >
      <header className="app-header" hidden={playing}>
        <div className="brand">
          <AppIcon />
          <div>
            <p className="eyebrow">{copy.host.eyebrow}</p>
            <h1>{copy.host.title}</h1>
          </div>
        </div>
      </header>
      <PackageStart
        hidden={packageDetails !== null || playing}
        openingRecentPackageId={openingRecentPackageId}
        recentPackages={recentPackages}
        recentPackagesLoading={recentPackagesLoading}
        onDownloadRecentPackage={onDownloadRecentPackage}
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
          copy={copy}
          customElements={customElements}
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
