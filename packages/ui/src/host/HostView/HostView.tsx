import './styles.scss';
import classNames from 'classnames';
import { getGameSurfaceStyle } from '../../game-presentation/game-surface-style';
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
  copy = LOCALIZATION_COPY.uk,
  message,
  onExit,
  presentation: {
    backgroundImage,
    backgroundOpacity,
    backgroundGradientFrom,
    backgroundGradientTo,
    backgroundGradientDirection,
    customElements = [],
    layout,
  },
  packages: {
    openingRecentPackageId = null,
    packageDetails,
    recentPackages,
    recentPackagesLoading = false,
    onBack,
    onDelete,
    onDownload,
    onOpen,
    onOpenRecent,
    onStart,
  },
  session: { finished, game, onBack: onGameBack, onNext: onGameNext, onReturn },
}: HostViewProps) {
  const playing = game !== null || finished;
  return (
    <Page
      className={classNames('host-app', 'game-presentation', {
        'is-playing': playing,
      })}
      title={copy.shell.host.label}
      headerContent={<p>{copy.shell.host.description}</p>}
      headerActions={
        !playing && !packageDetails ? (
          <GamePackageActions compact hidden={false} onOpen={onOpen} />
        ) : undefined
      }
      onBack={onExit ?? onBack}
    >
      <main
        id="schdk-host-app"
        style={getGameSurfaceStyle({
          backgroundImage,
          backgroundOpacity,
          backgroundGradientFrom,
          backgroundGradientTo,
          backgroundGradientDirection,
        })}
      >
        <RecentGamePackages
          hidden={packageDetails !== null || playing}
          loading={recentPackagesLoading}
          openingPackageId={openingRecentPackageId}
          packages={recentPackages}
          onDelete={onDelete}
          onDownload={onDownload}
          onOpen={onOpenRecent}
        />
        {packageDetails && !playing && (
          <GamePackageDetails
            details={packageDetails}
            onBack={onBack}
            onStart={onStart}
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
        {finished && <GameFinished onReturn={onReturn} />}
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
