import type { EditorTextOptions, GameOptions } from '@schdk/ui/options';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  initializeDriveSettings,
  loadLocalDriveSettings,
  mergeDriveSettings,
  saveLocalDriveSettings,
} from './drive-settings-storage';
import { saveEditorTextOptions } from './editor-options-storage';
import { saveGameOptions } from './game-options-storage';
import { BrowserGoogleDriveBridge } from './google-drive-browser';
import type {
  GoogleDriveBridge,
  GoogleDriveConnection,
} from './google-drive-types';

interface SyncedSettings {
  editorTextOptions: EditorTextOptions;
  gameOptions: GameOptions;
  setEditorTextOptions(options: EditorTextOptions): void;
  setGameOptions(options: GameOptions): void;
}

const DEFAULT_WEB_CLIENT_ID =
  '177890331671-3huqgkgv5b54ieiasbs93vg346otkubc.apps.googleusercontent.com';

function createBridge(): GoogleDriveBridge | null {
  if (window.desktop?.googleDrive) return window.desktop.googleDrive;
  const clientId =
    import.meta.env.VITE_GOOGLE_WEB_CLIENT_ID?.trim() || DEFAULT_WEB_CLIENT_ID;
  return new BrowserGoogleDriveBridge(clientId);
}

export function useGoogleDriveSettings({
  editorTextOptions,
  gameOptions,
  setEditorTextOptions,
  setGameOptions,
}: SyncedSettings) {
  const [bridge] = useState(createBridge);
  const [connection, setConnection] = useState<GoogleDriveConnection>(
    bridge ? { state: 'disconnected' } : { state: 'unavailable' },
  );
  const [accountId, setAccountId] = useState<string>();
  const [statusReady, setStatusReady] = useState(!bridge);
  const [revision, setRevision] = useState(0);
  const settings = useRef(
    loadLocalDriveSettings(localStorage, editorTextOptions, gameOptions),
  );
  const syncQueue = useRef(Promise.resolve());

  function applySettings(next: typeof settings.current) {
    settings.current = next;
    const editor = next.sections.editorTextOptions.value as EditorTextOptions;
    const game = next.sections.gameOptions.value as GameOptions;
    saveEditorTextOptions(localStorage, editor);
    saveGameOptions(localStorage, game);
    saveLocalDriveSettings(localStorage, next);
    setEditorTextOptions(editor);
    setGameOptions(game);
  }

  async function synchronize() {
    if (!bridge) return;
    const remote = await bridge.loadSettings();
    const merged =
      remote === null
        ? initializeDriveSettings(settings.current)
        : mergeDriveSettings(settings.current, remote);
    applySettings(merged);
    await bridge.saveSettings(merged);
  }

  async function handleSyncFailure() {
    const account =
      connection.state === 'connected' ? connection.account : undefined;
    try {
      const status = await bridge?.status();
      setConnection(
        status?.state === 'disconnected'
          ? { state: 'reauthorization-required', account }
          : { state: 'error', account },
      );
    } catch {
      setConnection({ state: 'error', account });
    }
  }

  function enqueueSync() {
    syncQueue.current = syncQueue.current
      .catch(() => undefined)
      .then(synchronize)
      .catch(handleSyncFailure);
    return syncQueue.current;
  }

  const enqueueSyncEvent = useEffectEvent(enqueueSync);

  useEffect(() => {
    if (!bridge) return;
    let active = true;
    void bridge
      .status()
      .then(async (status) => {
        if (!active) return;
        if (status.state === 'unavailable') {
          setConnection({ state: 'unavailable' });
        } else if (status.state === 'connected' && status.account) {
          setAccountId(status.account.emailAddress);
          setConnection({ state: 'connected', account: status.account });
          enqueueSyncEvent();
        }
      })
      .catch(() => active && setConnection({ state: 'error' }))
      .finally(() => active && setStatusReady(true));
    return () => {
      active = false;
    };
  }, [bridge]);

  useEffect(() => {
    if (connection.state !== 'connected' || revision === 0) return;
    const timeout = window.setTimeout(enqueueSyncEvent, 1000);
    return () => window.clearTimeout(timeout);
  }, [connection.state, revision]);

  function changeEditorTextOptions(value: EditorTextOptions) {
    const now = new Date().toISOString();
    settings.current = {
      ...settings.current,
      sections: {
        ...settings.current.sections,
        editorTextOptions: { updatedAt: now, value },
      },
    };
    saveEditorTextOptions(localStorage, value);
    saveLocalDriveSettings(localStorage, settings.current);
    setEditorTextOptions(value);
    setRevision((value) => value + 1);
  }

  function changeGameOptions(value: GameOptions) {
    const now = new Date().toISOString();
    settings.current = {
      ...settings.current,
      sections: {
        ...settings.current.sections,
        gameOptions: { updatedAt: now, value },
      },
    };
    saveGameOptions(localStorage, value);
    saveLocalDriveSettings(localStorage, settings.current);
    setGameOptions(value);
    setRevision((value) => value + 1);
  }

  async function connect() {
    if (!bridge) return;
    setConnection({ state: 'connecting' });
    try {
      const account = await bridge.connect();
      setAccountId(account.emailAddress);
      setConnection({ state: 'connected', account });
      await enqueueSync();
    } catch {
      setConnection({ state: 'error' });
    } finally {
      setStatusReady(true);
    }
  }

  async function disconnect() {
    if (!bridge) return;
    try {
      await bridge.disconnect();
      setConnection({ state: 'disconnected' });
    } catch {
      const account =
        connection.state === 'connected' ? connection.account : undefined;
      setConnection({ state: 'error', account });
    }
  }

  return {
    bridge,
    accountId,
    connection,
    statusReady,
    connect,
    disconnect,
    reportFailure: handleSyncFailure,
    setEditorTextOptions: changeEditorTextOptions,
    setGameOptions: changeGameOptions,
  };
}
