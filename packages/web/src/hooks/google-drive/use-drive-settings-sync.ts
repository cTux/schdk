import type { GameOptions } from '@schdk/common';
import type { EditorTextOptions } from '@schdk/ui/options';
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
  const [gameOptionsStorageFailed, setGameOptionsStorageFailed] =
    useState(false);
  const [revision, setRevision] = useState(0);
  const settings = useRef(
    loadLocalDriveSettings(localStorage, editorTextOptions, gameOptions),
  );
  const syncQueue = useRef(Promise.resolve());

  const synchronize = useCallback(async () => {
    if (!bridge) return;
    const remote = await bridge.loadSettings();
    const merged =
      remote === null
        ? initializeDriveSettings(settings.current)
        : mergeDriveSettings(settings.current, remote);
    settings.current = merged;
    const editor = merged.sections.editorTextOptions.value;
    const game = merged.sections.gameOptions.value;
    saveEditorTextOptions(localStorage, editor);
    setGameOptionsStorageFailed(!saveGameOptions(localStorage, game));
    saveLocalDriveSettings(localStorage, merged);
    setEditorTextOptions(editor);
    setGameOptions(game);
    await bridge.saveSettings(merged);
  }, [bridge, setEditorTextOptions, setGameOptions]);

  const enqueueSync = useCallback(() => {
    syncQueue.current = syncQueue.current
      .catch(() => undefined)
      .then(synchronize);
    return syncQueue.current;
  }, [synchronize]);

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
    setGameOptionsStorageFailed(!saveGameOptions(localStorage, value));
    saveLocalDriveSettings(localStorage, settings.current);
    setGameOptions(value);
    setRevision((value) => value + 1);
  }

  return {
    enqueueSync,
    gameOptionsStorageFailed,
    revision,
    setEditorTextOptions: changeEditorTextOptions,
    setGameOptions: changeGameOptions,
  };
}
