import type { GamePackage } from '@schdk/common';
import type { LocalizationCopy } from '@schdk/ui/localization';
import {
  useEffect,
  type Dispatch,
  type MutableRefObject,
  type SetStateAction,
} from 'react';
import { replaceBrowserPackageDeepLink } from './browser-deep-link';
import {
  saveDesktopEditorSession,
  type DesktopEditorSession,
} from './desktop-session';
import { loadRecentWebPackage } from './recent-packages';

interface EditorOpeningOptions {
  copy: LocalizationCopy;
  fileName: string | null;
  hasPackage: boolean;
  selectedIndex: number;
  initialDeepLink: MutableRefObject<string | null>;
  initialDeepLinkedQuestion: MutableRefObject<number | null>;
  initialDesktopSession: MutableRefObject<DesktopEditorSession | null>;
  applyOpenedPackage(
    content: Uint8Array,
    filePath: string | null,
    fileName: string,
  ): GamePackage;
  refreshRecentPackages(): Promise<void>;
  rememberBrowserPackage(
    name: string,
    title: string,
    content: Uint8Array,
  ): Promise<void>;
  setDesktopSessionReady: Dispatch<SetStateAction<boolean>>;
  setMessage: Dispatch<SetStateAction<string>>;
  setSelectedIndex: Dispatch<SetStateAction<number>>;
}

export function useEditorOpening({
  copy,
  fileName,
  hasPackage,
  selectedIndex,
  initialDeepLink,
  initialDeepLinkedQuestion,
  initialDesktopSession,
  applyOpenedPackage,
  refreshRecentPackages,
  rememberBrowserPackage,
  setDesktopSessionReady,
  setMessage,
  setSelectedIndex,
}: EditorOpeningOptions) {
  useEffect(() => {
    if (!hasPackage) void refreshRecentPackages();
  }, [hasPackage, refreshRecentPackages]);

  useEffect(() => {
    const packageName = initialDeepLink.current;
    if (!packageName) return;
    initialDeepLink.current = null;
    void (async () => {
      try {
        const content = await loadRecentWebPackage(packageName);
        if (!content) throw new Error('Deep-linked package is unavailable');
        const openedPackage = applyOpenedPackage(content, null, packageName);
        setSelectedIndex(initialDeepLinkedQuestion.current ?? 0);
        await rememberBrowserPackage(packageName, openedPackage.title, content);
      } catch {
        replaceBrowserPackageDeepLink(null);
        setMessage(copy.editor.deepLinkOpenFailed);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    initialDeepLink,
    initialDeepLinkedQuestion,
    rememberBrowserPackage,
    setMessage,
    setSelectedIndex,
  ]);

  useEffect(() => {
    if (!window.desktop && hasPackage && fileName) {
      replaceBrowserPackageDeepLink(fileName, selectedIndex);
    }
  }, [fileName, hasPackage, selectedIndex]);

  useEffect(() => {
    const desktop = window.desktop;
    const session = initialDesktopSession.current;
    if (!desktop || !session) return;
    initialDesktopSession.current = null;
    void (async () => {
      try {
        const opened = await desktop.openRecentGamePackage(session.filePath);
        applyOpenedPackage(opened.content, opened.filePath, opened.fileName);
        setSelectedIndex(session.selectedIndex);
      } catch {
        saveDesktopEditorSession(localStorage, window.location.pathname, null);
        setMessage(copy.editor.restoreFileFailed);
      } finally {
        setDesktopSessionReady(true);
      }
    })();
  }, [
    applyOpenedPackage,
    copy,
    initialDesktopSession,
    setDesktopSessionReady,
    setMessage,
    setSelectedIndex,
  ]);
}
