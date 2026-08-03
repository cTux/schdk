import type { GameOptions } from '@schdk/common/game-options';
import type { EditorTextOptions } from '@schdk/common/app-settings';
import { useCallback, useRef, useState } from 'react';
import { saveEditorTextOptions } from '../../storage/editor/editor-options-storage';
import {
  initializeDriveSettings,
  loadLocalDriveSettings,
  mergeDriveSettings,
  saveLocalDriveSettings,
} from '../../storage/google-drive/drive-settings-storage';
import { saveGameOptions } from '../../storage/options/save-game-options';
import type { DriveSettingsStorage } from '../../types/google-drive/google-drive-types';
import {
  collectVisualAssetReferences,
  externalizeVisualAssets,
  hydrateVisualAssets,
} from '../../storage/google-drive/visual-assets-storage';

interface DriveSettingsSyncOptions {
  bridge: DriveSettingsStorage | null;
  editorTextOptions: EditorTextOptions;
  gameOptions: GameOptions;
  setEditorTextOptions(options: EditorTextOptions): void;
  setGameOptions(options: GameOptions): void;
}

export function useDriveSettingsSync({
  bridge,
  editorTextOptions,
  gameOptions,
  setEditorTextOptions,
  setGameOptions,
}: DriveSettingsSyncOptions) {
  const [localStorageFailed, setLocalStorageFailed] = useState(false);
  const [settingsSyncFailed, setSettingsSyncFailed] = useState(false);
  const [revision, setRevision] = useState(0);
  const settings = useRef(
    loadLocalDriveSettings(localStorage, editorTextOptions, gameOptions),
  );
  const dirtySections = useRef({ editorTextOptions: 0, gameOptions: 0 });
  const syncQueue = useRef(Promise.resolve());

  const synchronize = useCallback(async () => {
    if (!bridge) return;
    const [remote, remoteAssets] = await Promise.all([
      bridge.loadSettings(),
      bridge.loadVisualAssets(),
    ]);
    const hydratedRemote = remote
      ? {
          ...remote,
          value: hydrateVisualAssets(
            remote.value,
            remoteAssets?.value ?? { schemaVersion: 1, assets: {} },
          ),
        }
      : null;
    const remoteMerged =
      hydratedRemote === null
        ? initializeDriveSettings(settings.current)
        : mergeDriveSettings(settings.current, hydratedRemote.value);
    const dirtyAtStart = { ...dirtySections.current };
    const merged = {
      ...remoteMerged,
      sections: {
        ...remoteMerged.sections,
        ...(dirtyAtStart.editorTextOptions
          ? { editorTextOptions: settings.current.sections.editorTextOptions }
          : {}),
        ...(dirtyAtStart.gameOptions
          ? { gameOptions: settings.current.sections.gameOptions }
          : {}),
      },
    };
    settings.current = merged;
    const editor = merged.sections.editorTextOptions.value;
    const game = merged.sections.gameOptions.value;
    saveEditorTextOptions(localStorage, editor);
    setLocalStorageFailed(!saveGameOptions(localStorage, game));
    saveLocalDriveSettings(localStorage, merged);
    setEditorTextOptions(editor);
    setGameOptions(game);
    const externalized = externalizeVisualAssets(
      merged,
      remoteAssets?.value ?? { schemaVersion: 1, assets: {} },
      collectVisualAssetReferences(remote?.value),
    );
    const hasAssets = Object.keys(externalized.assets.assets).length > 0;
    const assetsSaved =
      !remoteAssets && !hasAssets
        ? true
        : await bridge.saveVisualAssets(
            externalized.assets,
            remoteAssets?.etag ?? null,
          );
    if (!assetsSaved) {
      setSettingsSyncFailed(true);
      throw new Error('Google Drive visual assets changed before save');
    }
    const saved = await bridge.saveSettings(
      externalized.settings,
      remote?.etag ?? null,
    );
    setSettingsSyncFailed(!saved);
    if (!saved) throw new Error('Google Drive settings changed before save');
    if (
      dirtySections.current.editorTextOptions === dirtyAtStart.editorTextOptions
    ) {
      dirtySections.current.editorTextOptions = 0;
    }
    if (dirtySections.current.gameOptions === dirtyAtStart.gameOptions) {
      dirtySections.current.gameOptions = 0;
    }
  }, [bridge, setEditorTextOptions, setGameOptions]);

  const enqueueSync = useCallback(() => {
    syncQueue.current = syncQueue.current
      .catch(() => undefined)
      .then(synchronize);
    return syncQueue.current;
  }, [synchronize]);

  function changeEditorTextOptions(value: EditorTextOptions) {
    dirtySections.current.editorTextOptions += 1;
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
    dirtySections.current.gameOptions += 1;
    const now = new Date().toISOString();
    settings.current = {
      ...settings.current,
      sections: {
        ...settings.current.sections,
        gameOptions: { updatedAt: now, value },
      },
    };
    setLocalStorageFailed(!saveGameOptions(localStorage, value));
    saveLocalDriveSettings(localStorage, settings.current);
    setGameOptions(value);
    setRevision((value) => value + 1);
  }

  return {
    enqueueSync,
    gameOptionsStorageFailed: localStorageFailed || settingsSyncFailed,
    revision,
    setEditorTextOptions: changeEditorTextOptions,
    setGameOptions: changeGameOptions,
  };
}
