import { serializeGamePackage, type GamePackage } from '@schdk/common';
import type { EditorSaveStatus, RecentPackageItem } from '@schdk/ui/editor';
import type { LocalizationCopy } from '@schdk/ui/localization';
import type { Dispatch, SetStateAction } from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import { saveWithPicker } from './browser-save';
import { createPackageFilename } from './package-filename';
import { loadRecentWebPackage } from './recent-packages';

interface PackageActionsOptions {
  copy: LocalizationCopy;
  fileName: string | null;
  gamePackage: GamePackage;
  saveStatus: EditorSaveStatus;
  applyOpenedPackage(
    content: Uint8Array,
    filePath: string | null,
    fileName: string,
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
    fileName,
    gamePackage,
    saveStatus,
    applyOpenedPackage,
    clearDraft,
    createLocalizedPackage,
    refreshRecentPackages,
    rememberBrowserPackage,
    saveCurrentPackage,
    setFileName,
    setFilePath,
    setGamePackage,
    setHasPackage,
    setMessage,
    setSaveStatus,
    setSelectedIndex,
    setShowValidation,
  } = options;

  async function savePackageInBrowser(
    packageToSave: GamePackage,
    suggestedName: string,
  ) {
    const content = serializeGamePackage(packageToSave);
    if (window.showSaveFilePicker) {
      const name = await saveWithPicker(
        window.showSaveFilePicker.bind(window),
        suggestedName,
        content,
        copy.editor.filePickerDescription,
      );
      return name ? { name, content } : null;
    }
    const url = URL.createObjectURL(
      new Blob([new Uint8Array(content)], { type: 'application/zip' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = suggestedName;
    link.click();
    URL.revokeObjectURL(url);
    return { name: suggestedName, content };
  }

  async function createPackageFile(packageToSave: GamePackage) {
    setMessage('');
    const filename = createPackageFilename(
      packageToSave.title,
      new Date(),
      copy.editor.unfinishedGame,
    );
    try {
      if (window.desktop) {
        const savedPath = await window.desktop.saveGamePackage(
          filename,
          serializeGamePackage(packageToSave),
        );
        if (!savedPath) return false;
        setFilePath(savedPath);
        const pathParts = savedPath.split(/[\\/]/u);
        setFileName(pathParts[pathParts.length - 1] || filename);
      } else {
        const saved = await savePackageInBrowser(packageToSave, filename);
        if (!saved) return false;
        setFileName(saved.name);
        await rememberBrowserPackage(
          saved.name,
          packageToSave.title,
          saved.content,
        );
        replaceBrowserPackageDeepLink(saved.name, 0);
      }
      setSaveStatus('saved');
      return true;
    } catch {
      setMessage(copy.editor.saveFailed);
      return false;
    }
  }

  async function openPackage(file: File) {
    setMessage('');
    try {
      const opened = window.desktop
        ? await window.desktop.openGamePackage(file)
        : {
            filePath: null,
            content: new Uint8Array(await file.arrayBuffer()),
          };
      const openedPackage = applyOpenedPackage(
        opened.content,
        opened.filePath,
        file.name,
      );
      if (!window.desktop) {
        await rememberBrowserPackage(
          file.name,
          openedPackage.title,
          opened.content,
        );
        replaceBrowserPackageDeepLink(file.name, 0);
      }
    } catch {
      setMessage(copy.editor.invalidFile);
    }
  }

  async function openRecentPackage(recent: RecentPackageItem) {
    setMessage('');
    try {
      if (window.desktop) {
        const opened = await window.desktop.openRecentGamePackage(recent.id);
        applyOpenedPackage(opened.content, opened.filePath, opened.fileName);
      } else {
        const content = await loadRecentWebPackage(recent.id);
        if (!content) throw new Error('Recent package is unavailable');
        const openedPackage = applyOpenedPackage(content, null, recent.name);
        await rememberBrowserPackage(recent.name, openedPackage.title, content);
        replaceBrowserPackageDeepLink(recent.name, 0);
      }
      await refreshRecentPackages();
    } catch {
      setMessage(copy.editor.recentOpenFailed);
      await refreshRecentPackages();
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
      if (window.desktop) {
        await saveCurrentPackage();
      } else if (saveStatus !== 'saved') {
        const oldFileName = fileName;
        const saved = await savePackageInBrowser(
          gamePackage,
          createPackageFilename(
            gamePackage.title,
            new Date(),
            copy.editor.unfinishedGame,
          ),
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
      setFileName(null);
      setSaveStatus('saved');
      setSelectedIndex(0);
      setShowValidation(false);
      setMessage('');
      replaceBrowserPackageDeepLink(null);
    } catch {
      setMessage(copy.editor.autoSaveFailed);
    }
  }

  return { closePackage, createPackage, openPackage, openRecentPackage };
}
