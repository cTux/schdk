import {
  hasGamePackageRemarks,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  toDrivePackageReference,
  type DriveGamePackageFile,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import { showEditorToast, type EditorSaveStatus } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { Dispatch, SetStateAction } from 'react';
import { replaceBrowserPackageDeepLink } from './opening/browser-deep-link';
import { usePackageOpeningActions } from './opening/use-package-opening-actions';

interface PackageActionsOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveFileId: string | null;
  locale: AppLocale;
  saveStatus: EditorSaveStatus;
  applyOpenedPackage(
    content: Uint8Array,
    opened: DriveGamePackageFile,
    selectedIndex?: number,
  ): GamePackage;
  createLocalizedPackage(): GamePackage;
  refreshRecentPackages(): Promise<void>;
  saveCurrentPackage(): Promise<boolean>;
  onDriveFailure?(): void;
  changeGamePackage: Dispatch<SetStateAction<GamePackage>>;
  resetPackage(gamePackage: GamePackage): void;
  setMessage: Dispatch<SetStateAction<string>>;
  setShowValidation: Dispatch<SetStateAction<boolean>>;
}

export function usePackageActions(options: PackageActionsOptions) {
  const {
    confirm,
    copy,
    drive,
    driveFileId,
    locale,
    saveStatus,
    applyOpenedPackage,
    createLocalizedPackage,
    refreshRecentPackages,
    saveCurrentPackage,
    onDriveFailure,
    changeGamePackage,
    resetPackage: resetEditorSession,
    setMessage,
    setShowValidation,
  } = options;
  const opening = usePackageOpeningActions({
    confirm,
    copy,
    drive,
    locale,
    applyOpenedPackage,
    refreshRecentPackages,
    onDriveFailure,
    setMessage,
  });

  function resetPackage() {
    resetEditorSession(createLocalizedPackage());
    setShowValidation(false);
    setMessage('');
    replaceBrowserPackageDeepLink(null);
  }

  async function createPackage() {
    const emptyPackage = createLocalizedPackage();
    const filename = createGamePackageFilename(
      emptyPackage.title,
      copy.editor.unfinishedGame,
    );
    setMessage('');
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const content = serializeGamePackage(emptyPackage);
      const saved = await drive.createGamePackage({
        name: filename,
        title: emptyPackage.title,
        content,
        ready: validateGamePackage(emptyPackage).length === 0,
        hasRemarks: hasGamePackageRemarks(emptyPackage),
      });
      applyOpenedPackage(content, saved);
      setShowValidation(false);
      replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      await refreshRecentPackages();
      showEditorToast('created', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
    }
  }

  async function closePackage() {
    try {
      if (
        driveFileId &&
        saveStatus !== 'saved' &&
        !(await saveCurrentPackage())
      )
        return;
      resetPackage();
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.autoSaveFailed);
    }
  }

  async function deletePackage(title: string) {
    if (!(await confirm(copy.shared.deletePackageConfirmation(title)))) return;

    setMessage('');
    try {
      if (!drive || !driveFileId)
        throw new Error('Google Drive is unavailable');
      await drive.deleteGamePackage(driveFileId);
      resetPackage();
      await refreshRecentPackages();
      showEditorToast('deleted', locale);
    } catch {
      onDriveFailure?.();
      setMessage(copy.shared.deletePackageFailed);
    }
  }

  function updateTourPhrase(index: number, value: string) {
    changeGamePackage((current) => ({
      ...current,
      tourPhrases: current.tourPhrases.map((phrase, phraseIndex) =>
        phraseIndex === index ? value : phrase,
      ) as GamePackage['tourPhrases'],
    }));
    setMessage('');
  }

  return {
    closePackage,
    createPackage,
    deletePackage,
    updateTourPhrase,
    ...opening,
  };
}
