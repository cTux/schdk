import {
  serializeGamePackage,
  validateGamePackage,
  type GamePackage,
} from '@schdk/common';
import {
  toDrivePackageReference,
  type DrivePackageStorage,
} from '@schdk/google-drive';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import type { Dispatch, SetStateAction } from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import { createPackageFilename } from './package-filename';
import { usePackageOpeningActions } from './use-package-opening-actions';

interface PackageActionsOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveFileId: string | null;
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
    copy,
    drive,
    driveFileId,
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
    copy,
    drive,
    applyOpenedPackage,
    refreshRecentPackages,
    onDriveFailure,
    setMessage,
  });

  async function createPackage() {
    const emptyPackage = createLocalizedPackage();
    const filename = createPackageFilename(
      emptyPackage.title,
      new Date(),
      copy.editor.unfinishedGame,
    );
    setMessage('');
    try {
      if (!drive) throw new Error('Google Drive is unavailable');
      const saved = await drive.createGamePackage({
        name: filename,
        content: serializeGamePackage(emptyPackage),
        ready: validateGamePackage(emptyPackage).length === 0,
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
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
    }
  }

  async function closePackage() {
    try {
      if (driveFileId && saveStatus !== 'saved') await saveCurrentPackage();
      setGamePackage(createLocalizedPackage());
      setHasPackage(false);
      setDriveFileId(null);
      setFileName(null);
      setSaveStatus('saved');
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('');
      replaceBrowserPackageDeepLink(null);
    } catch {
      onDriveFailure?.();
      setMessage(copy.editor.autoSaveFailed);
    }
  }

  return { closePackage, createPackage, ...opening };
}
