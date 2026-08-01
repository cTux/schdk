import type { GameOptions } from '@schdk/common';
import type { EditorTextOptions } from '@schdk/ui/options';
import { useEffect, useEffectEvent, useState } from 'react';
import { BrowserGoogleDriveBridge } from '../../services/google-drive/google-drive-browser';
import type { GoogleDriveBridge } from '../../types/google-drive/google-drive-types';
import { useDriveSettingsSync } from './use-drive-settings-sync';
import { useGoogleDriveConnection } from './use-google-drive-connection';

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

export function useGoogleDriveSettings(options: SyncedSettings) {
  const [bridge] = useState(createBridge);
  const settings = useDriveSettingsSync({ bridge, ...options });
  const connection = useGoogleDriveConnection(bridge, settings.enqueueSync);
  const enqueueSyncEvent = useEffectEvent(() =>
    settings.enqueueSync().catch(connection.reportFailure),
  );

  useEffect(() => {
    if (connection.connection.state !== 'connected' || settings.revision === 0)
      return;
    const timeout = window.setTimeout(enqueueSyncEvent, 1000);
    return () => window.clearTimeout(timeout);
  }, [connection.connection.state, settings.revision]);

  return {
    bridge,
    ...connection,
    gameOptionsStorageFailed: settings.gameOptionsStorageFailed,
    setEditorTextOptions: settings.setEditorTextOptions,
    setGameOptions: settings.setGameOptions,
  };
}
