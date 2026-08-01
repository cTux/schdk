import './styles.scss';
import classNames from 'classnames';
import type { CSSProperties } from 'react';
import { StatusMessage } from '../../atoms/StatusMessage';
import { GamePackageActions, RecentGamePackages } from '../../game-packages';
import { LOCALIZATION_COPY } from '../../localization';
import { Page } from '../../shell/Page';
import { GameFinished } from '../GameFinished';
import { GamePackageDetails } from '../GamePackageDetails';
import { GameWizard } from '../GameWizard';
import type { RecentPackageItem } from '../../game-packages';
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
  onExit,
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
    <Page
      className={classNames('editor-app', 'host-app', {
        'is-playing': playing,
      })}
      title={copy.shell.host.label}
      headerContent={<p>{copy.shell.host.description}</p>}
      headerActions={
        !playing && !packageDetails ? (
          <GamePackageActions compact hidden={false} onOpen={onOpenPackage} />
        ) : undefined
      }
      onBack={onExit ?? onBack}
    >
      <main
        id="schdk-host-app"
        style={
          {
            '--game-surface-background-image': backgroundImage
              ? `url(${JSON.stringify(backgroundImage)})`
              : 'none',
            '--game-surface-background-opacity': backgroundOpacity,
          } as CSSProperties
        }
      >
        <RecentGamePackages
          hidden={packageDetails !== null || playing}
          loading={recentPackagesLoading}
          openingPackageId={openingRecentPackageId}
          packages={recentPackages}
          onDelete={onDeleteRecentPackage}
          onDownload={onDownloadRecentPackage}
          onOpen={onOpenRecentPackage}
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
    </Page>
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
