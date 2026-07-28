import {
  hasGamePackageRemarks,
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  createGamePackageFilename,
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import { showEditorToast, type EditorSaveStatus } from '@schdk/ui/editor';
import type { AppLocale, LocalizationCopy } from '@schdk/ui/localization';
import type { Dispatch, SetStateAction } from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import { usePackageOpeningActions } from './use-package-opening-actions';

interface PackageActionsOptions {
  confirm(message: string): Promise<boolean>;
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveFileId: string | null;
  locale: AppLocale;
  saveStatus: EditorSaveStatus;
  applyOpenedPackage(
    content: Uint8Array,
    fileName: string,
    driveFileId: string,
  ): GamePackage;
  createLocalizedPackage(): GamePackage;
  refreshRecentPackages(): Promise<void>;
  saveCurrentPackage(): Promise<void>;
  onDriveFailure?(): void;
  setDriveFileId: Dispatch<SetStateAction<string | null>>;
  setFileName: Dispatch<SetStateAction<string | null>>;
  setGamePackage: Dispatch<SetStateAction<GamePackage>>;
  setHasPackage: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSaveStatus: Dispatch<SetStateAction<EditorSaveStatus>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
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
    setDriveFileId,
    setFileName,
    setGamePackage,
    setHasPackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
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
    setGamePackage(createLocalizedPackage());
    setHasPackage(false);
    setDriveFileId(null);
    setFileName(null);
    setSaveStatus('saved');
    setSelectedIndex(0);
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
      const saved = await drive.createGamePackage({
        name: filename,
        title: emptyPackage.title,
        content: serializeGamePackage(emptyPackage),
        ready: validateGamePackage(emptyPackage).length === 0,
        hasRemarks: hasGamePackageRemarks(emptyPackage),
      });
      setDriveFileId(saved.id);
      setFileName(saved.name);
      setGamePackage(emptyPackage);
      setHasPackage(true);
      setSaveStatus('saved');
      setSelectedIndex(0);
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
      if (driveFileId && saveStatus !== 'saved') await saveCurrentPackage();
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

  return { closePackage, createPackage, deletePackage, ...opening };
}
