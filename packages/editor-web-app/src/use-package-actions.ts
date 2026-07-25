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
import { savePackageLocally } from './local-package-save';
import { usePackageOpeningActions } from './use-package-opening-actions';

interface PackageActionsOptions {
  copy: LocalizationCopy;
  drive?: DrivePackageStorage;
  driveConnected: boolean;
  driveFileId: string | null;
  fileName: string | null;
  gamePackage: GamePackage;
  saveStatus: EditorSaveStatus;
  applyOpenedPackage(
    content: Uint8Array,
    filePath: string | null,
    fileName: string,
    driveFileId?: string | null,
    recovered?: boolean,
  ): GamePackage;
  clearDraft(name: string): void;
  createLocalizedPackage(): GamePackage;
  refreshRecentPackages(): Promise<void>;
  rememberBrowserPackage(
    name: string,
    title: string,
    content: Uint8Array,
  ): Promise<void>;
  saveCurrentPackage(): Promise<void>;
  onDriveFailure?(): void;
  setDriveFileId: Dispatch<SetStateAction<string | null>>;
  setFileName: Dispatch<SetStateAction<string | null>>;
  setFilePath: Dispatch<SetStateAction<string | null>>;
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
    driveConnected,
    driveFileId,
    fileName,
    gamePackage,
    saveStatus,
    applyOpenedPackage,
    clearDraft,
    createLocalizedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    saveCurrentPackage,
    onDriveFailure,
    setDriveFileId,
    setFileName,
    setFilePath,
    setGamePackage,
    setHasPackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
    setShowValidation,
  } = options;
  const { openPackage, openRecentPackage } = usePackageOpeningActions({
    copy,
    drive,
    driveConnected,
    applyOpenedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    onDriveFailure,
    setMessage,
  });

  async function createPackageFile(packageToSave: GamePackage) {
    setMessage('');
    const filename = createPackageFilename(
      packageToSave.title,
      new Date(),
      copy.editor.unfinishedGame,
    );
    try {
      if (driveConnected && drive) {
        const saved = await drive.createGamePackage({
          name: filename,
          content: serializeGamePackage(packageToSave),
          ready: validateGamePackage(packageToSave).length === 0,
        });
        setDriveFileId(saved.id);
        setFilePath(null);
        setFileName(saved.name);
        replaceBrowserPackageDeepLink(toDrivePackageReference(saved.id), 0);
      } else {
        const saved = await savePackageLocally(
          packageToSave,
          filename,
          copy.editor.filePickerDescription,
        );
        if (!saved) return false;
        setDriveFileId(null);
        setFilePath(saved.filePath);
        setFileName(saved.name);
        if (!window.desktop) {
          await rememberBrowserPackage(
            saved.name,
            packageToSave.title,
            saved.content,
          );
          replaceBrowserPackageDeepLink(saved.name, 0);
        }
      }
      setSaveStatus('saved');
      return true;
    } catch {
      if (driveConnected) onDriveFailure?.();
      setMessage(copy.editor.saveFailed);
      return false;
    }
  }

  async function createPackage() {
    const emptyPackage = createLocalizedPackage();
    if (!(await createPackageFile(emptyPackage))) return;
    setGamePackage(emptyPackage);
    setHasPackage(true);
    setSelectedIndex(0);
    setShowValidation(false);
  }

  async function closePackage() {
    try {
      if (driveFileId) {
        if (driveConnected && drive && saveStatus !== 'saved') {
          await saveCurrentPackage();
        } else if (saveStatus !== 'saved') {
          const saved = await savePackageLocally(
            gamePackage,
            fileName ??
              createPackageFilename(
                gamePackage.title,
                new Date(),
                copy.editor.unfinishedGame,
              ),
            copy.editor.filePickerDescription,
          );
          if (!saved) return;
          clearDraft(toDrivePackageReference(driveFileId));
        }
      } else if (window.desktop) {
        await saveCurrentPackage();
      } else if (saveStatus !== 'saved') {
        const oldFileName = fileName;
        const saved = await savePackageLocally(
          gamePackage,
          createPackageFilename(
            gamePackage.title,
            new Date(),
            copy.editor.unfinishedGame,
          ),
          copy.editor.filePickerDescription,
        );
        if (!saved) return;
        await rememberBrowserPackage(
          saved.name,
          gamePackage.title,
          saved.content,
        );
        if (oldFileName) clearDraft(oldFileName);
        if (saved.name !== oldFileName) clearDraft(saved.name);
      }
      setGamePackage(createLocalizedPackage());
      setHasPackage(false);
      setFilePath(null);
      setDriveFileId(null);
      setFileName(null);
      setSaveStatus('saved');
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('');
      replaceBrowserPackageDeepLink(null);
    } catch {
      if (driveFileId) onDriveFailure?.();
      setMessage(copy.editor.autoSaveFailed);
    }
  }

  return { closePackage, createPackage, openPackage, openRecentPackage };
}
