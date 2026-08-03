import {
  hasGamePackageRemarks,
  MAX_GAME_PACKAGE_BYTES,
  parseGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  toDrivePackageReference,
  type DrivePackageStorage,
  type DriveGamePackageFile,
} from '@schdk/google-drive/game-packages';
import { showEditorToast } from '@schdk/ui/editor';
import type { AppLocale } from '@schdk/common/app-settings';
import type { LocalizationCopy } from '@schdk/ui/localization';
import { useRecentGamePackageActions } from '../../hooks/game-packages/use-recent-game-package-actions';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';

interface PackageOpeningOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  locale: AppLocale;
  applyOpenedPackage(
    content: Uint8Array,
    opened: DriveGamePackageFile,
    selectedIndex?: number,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
  onDriveFailure?(): void;
  setMessage(message: string): void;
}

export function usePackageOpeningActions({
  confirm,
  copy,
  drive,
  locale,
  applyOpenedPackage,
  refreshRecentPackages,
  onDriveFailure,
  setMessage,
}: PackageOpeningOptions) {
  const { hasActiveAction, ...recentActions } = useRecentGamePackageActions({
    confirm,
    drive,
    messages: {
      deleteConfirmation: (recent) =>
        copy.shared.deletePackageConfirmation(recent.title || recent.name),
      deleteFailed: copy.shared.deletePackageFailed,
      downloadFailed: copy.editor.downloadFailed,
      openFailed: copy.editor.recentOpenFailed,
    },
    onDriveFailure,
    onMessage: setMessage,
    onOpen(opened) {
      applyOpenedPackage(opened.content, opened);
      replaceBrowserPackageDeepLink(toDrivePackageReference(opened.id), 0);
    },
    onOpened: () => showEditorToast('opened', locale),
    onDownloaded: () => showEditorToast('downloaded', locale),
    onDeleted: () => showEditorToast('deleted', locale),
    refreshRecentPackages,
  });

  async function openPackage(file: File) {
    if (hasActiveAction()) return;
    setMessage('');
    let content: Uint8Array;
    let gamePackage: GamePackage;
    try {
      if (file.size > MAX_GAME_PACKAGE_BYTES) {
        throw new Error('Package is too large');
      }
      content = new Uint8Array(await file.arrayBuffer());
      gamePackage = parseGamePackage(content);
    } catch {
      setMessage(copy.editor.invalidFile);
      return;
    }
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const saved = await drive.createGamePackage({
        name: createGamePackageFilename(
          gamePackage.title,
          copy.editor.unfinishedGame,
        ),
        title: gamePackage.title,
        content,
        ready: validateGamePackage(gamePackage).length === 0,
        hasRemarks: hasGamePackageRemarks(gamePackage),
      });
      applyOpenedPackage(content, saved);
      replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      await refreshRecentPackages();
      showEditorToast('imported', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
    }
  }

  return {
    ...recentActions,
    openPackage,
  };
}
