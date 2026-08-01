import { createEmptyGamePackage, type GamePackage } from '@schdk/common';
import type { DriveGamePackageFile } from '@schdk/google-drive/game-packages';
import type { EditorSaveStatus } from '@schdk/ui/editor';
import { useCallback, useReducer, type SetStateAction } from 'react';

interface EditorSessionState {
  gamePackage: GamePackage;
  hasPackage: boolean;
  driveFileId: string | null;
  driveModifiedTime: string | null;
  fileName: string | null;
  saveStatus: EditorSaveStatus;
  selectedIndex: number;
}

type EditorSessionAction =
  | { type: 'change'; value: SetStateAction<GamePackage> }
  | {
      type: 'open';
      gamePackage: GamePackage;
      file: DriveGamePackageFile;
      selectedIndex: number;
    }
  | { type: 'reset'; gamePackage: GamePackage }
  | { type: 'file-name'; value: SetStateAction<string | null> }
  | { type: 'modified-time'; value: SetStateAction<string | null> }
  | { type: 'save-status'; value: SetStateAction<EditorSaveStatus> }
  | { type: 'selected-index'; value: SetStateAction<number> };

function resolve<T>(value: SetStateAction<T>, current: T): T {
  return typeof value === 'function'
    ? (value as (current: T) => T)(current)
    : value;
}

function createEditorSessionState(title: string): EditorSessionState {
  return {
    gamePackage: { ...createEmptyGamePackage(), title },
    hasPackage: false,
    driveFileId: null,
    driveModifiedTime: null,
    fileName: null,
    saveStatus: 'saved',
    selectedIndex: 0,
  };
}

function editorSessionReducer(
  state: EditorSessionState,
  action: EditorSessionAction,
): EditorSessionState {
  switch (action.type) {
    case 'change':
      return {
        ...state,
        gamePackage: resolve(action.value, state.gamePackage),
        saveStatus: 'pending',
      };
    case 'open':
      return {
        gamePackage: action.gamePackage,
        hasPackage: true,
        driveFileId: action.file.id,
        driveModifiedTime: action.file.modifiedTime,
        fileName: action.file.name,
        saveStatus: 'saved',
        selectedIndex: action.selectedIndex,
      };
    case 'reset':
      return {
        ...createEditorSessionState(action.gamePackage.title),
        gamePackage: action.gamePackage,
      };
    case 'file-name':
      return { ...state, fileName: resolve(action.value, state.fileName) };
    case 'modified-time':
      return {
        ...state,
        driveModifiedTime: resolve(action.value, state.driveModifiedTime),
      };
    case 'save-status':
      return { ...state, saveStatus: resolve(action.value, state.saveStatus) };
    case 'selected-index':
      return {
        ...state,
        selectedIndex: resolve(action.value, state.selectedIndex),
      };
  }
}

function useEditorSession(untitledTitle: string) {
  const [state, dispatch] = useReducer(
    editorSessionReducer,
    untitledTitle,
    createEditorSessionState,
  );
  const changeGamePackage = useCallback(
    (value: SetStateAction<GamePackage>) => dispatch({ type: 'change', value }),
    [],
  );
  const openPackage = useCallback(
    (gamePackage: GamePackage, file: DriveGamePackageFile, selectedIndex = 0) =>
      dispatch({ type: 'open', gamePackage, file, selectedIndex }),
    [],
  );
  const resetPackage = useCallback(
    (gamePackage: GamePackage) => dispatch({ type: 'reset', gamePackage }),
    [],
  );
  const setFileName = useCallback(
    (value: SetStateAction<string | null>) =>
      dispatch({ type: 'file-name', value }),
    [],
  );
  const setDriveModifiedTime = useCallback(
    (value: SetStateAction<string | null>) =>
      dispatch({ type: 'modified-time', value }),
    [],
  );
  const setSaveStatus = useCallback(
    (value: SetStateAction<EditorSaveStatus>) =>
      dispatch({ type: 'save-status', value }),
    [],
  );
  const setSelectedIndex = useCallback(
    (value: SetStateAction<number>) =>
      dispatch({ type: 'selected-index', value }),
    [],
  );

  return {
    ...state,
    changeGamePackage,
    openPackage,
    resetPackage,
    setDriveModifiedTime,
    setFileName,
    setSaveStatus,
    setSelectedIndex,
  };
}

type EditorSession = ReturnType<typeof useEditorSession>;

export {
  createEditorSessionState,
  editorSessionReducer,
  type EditorSession,
  useEditorSession,
};
