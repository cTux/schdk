import type { ShellEditTarget, ShellViewName } from '@schdk/ui/shell';
import { useEffect, useState } from 'react';
import { getDeepLinkedPackageName } from './editor/deep-link';
import {
  getDeepLinkedShellEdit,
  getDeepLinkedShellView,
  getShellEditDeepLink,
  getShellDeepLink,
  loadDesktopShellView,
  saveDesktopShellView,
} from './desktop-session';

function getLinkedView(): ShellViewName | null {
  const url = new URL(window.location.href);
  const editTarget = getDeepLinkedShellEdit(url.href);
  return (
    getDeepLinkedShellView(url.href) ??
    (editTarget?.kind === 'question'
      ? 'artificialIntelligence'
      : editTarget?.kind === 'package'
        ? 'packageRules'
        : null) ??
    (url.searchParams.has('hostPackage') ? 'host' : null) ??
    (getDeepLinkedPackageName(url.href) ? 'editor' : null)
  );
}

export function useShellNavigation(sessionScope: string) {
  const [view, setView] = useState<ShellViewName>(
    () =>
      getLinkedView() ??
      loadDesktopShellView(localStorage, sessionScope) ??
      'home',
  );
  const [editTarget, setEditTarget] = useState<ShellEditTarget | null>(() =>
    getDeepLinkedShellEdit(window.location.href),
  );
  const [loadedApps, setLoadedApps] = useState({
    host: view === 'host',
    editor: view === 'editor',
  });

  useEffect(() => {
    saveDesktopShellView(localStorage, sessionScope, view);
    const deepLink = getShellDeepLink(window.location.href, view);
    if (deepLink !== window.location.href) {
      window.history.replaceState(window.history.state, '', deepLink);
    }
  }, [sessionScope, view]);

  useEffect(() => {
    function restore() {
      setEditTarget(getDeepLinkedShellEdit(window.location.href));
      activate(getLinkedView() ?? 'home');
    }
    window.addEventListener('popstate', restore);
    return () => window.removeEventListener('popstate', restore);
  }, []);

  function activate(nextView: ShellViewName) {
    if (nextView === 'host' || nextView === 'editor') {
      setLoadedApps((current) => ({ ...current, [nextView]: true }));
    }
    setView(nextView);
  }

  function showView(nextView: ShellViewName) {
    const deepLink = getShellEditDeepLink(
      getShellDeepLink(window.location.href, nextView),
      null,
    );
    window.history.pushState(window.history.state, '', deepLink);
    setEditTarget(null);
    activate(nextView);
  }

  function showEditor(nextTarget: ShellEditTarget) {
    const nextView =
      nextTarget.kind === 'question'
        ? 'artificialIntelligence'
        : 'packageRules';
    const deepLink = getShellEditDeepLink(
      getShellDeepLink(window.location.href, nextView),
      nextTarget,
    );
    window.history.pushState(window.history.state, '', deepLink);
    setEditTarget(nextTarget);
    activate(nextView);
  }

  function closeEditor() {
    const deepLink = getShellEditDeepLink(window.location.href, null);
    window.history.pushState(window.history.state, '', deepLink);
    setEditTarget(null);
  }

  return {
    view,
    loadedApps,
    editTarget,
    showView,
    showEditor,
    closeEditor,
  };
}
