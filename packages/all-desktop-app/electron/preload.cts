import {
  contextBridge,
  ipcRenderer,
  type IpcRendererEvent,
  webUtils,
} from 'electron';
import { isEditorFrameUrl } from './preload-routing.js';

declare const location: { href: string };

const closeApi = {
  onCloseRequested: (callback: (attempt: number) => void): (() => void) => {
    const listener = (_event: IpcRendererEvent, attempt: unknown) => {
      if (Number.isSafeInteger(attempt) && Number(attempt) > 0)
        callback(Number(attempt));
    };
    ipcRenderer.on('close-requested', listener);
    return () => ipcRenderer.removeListener('close-requested', listener);
  },
  finishCloseAttempt: (attempt: number, succeeded: boolean) =>
    ipcRenderer.send('close-attempt-finished', attempt, succeeded),
};

const editorApi = {
  saveGamePackage: (
    filename: string,
    content: Uint8Array,
  ): Promise<string | null> =>
    ipcRenderer.invoke('save-game-package', filename, content),
  openGamePackage: (file: File) =>
    ipcRenderer.invoke('open-game-package', webUtils.getPathForFile(file)),
  listRecentGamePackages: () => ipcRenderer.invoke('list-recent-game-packages'),
  openRecentGamePackage: (filePath: string) =>
    ipcRenderer.invoke('open-recent-game-package', filePath),
  writeGamePackage: (filePath: string, content: Uint8Array): Promise<void> =>
    ipcRenderer.invoke('write-game-package', filePath, content),
  ...closeApi,
};

const isEditorFrame = isEditorFrameUrl(
  new URL(location.href),
  process.isMainFrame,
);

if (process.isMainFrame) {
  contextBridge.exposeInMainWorld('desktop', closeApi);
} else if (isEditorFrame) {
  contextBridge.exposeInMainWorld('desktop', editorApi);
}
