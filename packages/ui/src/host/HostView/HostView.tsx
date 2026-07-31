import './styles.scss';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { AppIcon } from '../../atoms/AppIcon';
import { StatusMessage } from '../../atoms/StatusMessage';
import { PackageStart } from '../../editor/PackageStart';
import { LOCALIZATION_COPY } from '../../localization';
import { GameFinished } from '../GameFinished';
import { GamePackageDetails } from '../GamePackageDetails';
import { GameWizard } from '../GameWizard';
import type { RecentPackageItem } from '../../editor/types';
import type {
  HostGameTransition,
  HostGameView,
  HostQuestionStage,
} from '../types';
import { type HostViewProps } from './types/host-view-props';
import { type HostPackageDetails } from './types/host-package-details';

function HostView({
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
  onDeleteRecentPackage,
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
        onDeleteRecentPackage={onDeleteRecentPackage}
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

export {
  type RecentPackageItem,
  type HostGameTransition,
  type HostGameView,
  type HostQuestionStage,
  type HostPackageDetails,
  type HostViewProps,
  HostView,
};
