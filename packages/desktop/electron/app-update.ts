import { app, ipcMain, net, shell } from 'electron';

const latestReleaseUrl = 'https://github.com/cTux/schdk/releases/latest';

export function registerAppUpdateIpc() {
  ipcMain.handle('check-app-update', async () => {
    if (!app.isPackaged) return false;
    try {
      const response = await net.fetch(latestReleaseUrl, { method: 'HEAD' });
      const latestTag = new URL(response.url).pathname
        .match(/\/releases\/tag\/([^/]+)$/u)
        ?.at(1);
      return (
        response.ok &&
        latestTag !== undefined &&
        latestTag !== `v${app.getVersion()}`
      );
    } catch {
      return false;
    }
  });
  ipcMain.handle('open-app-release-page', () =>
    shell.openExternal(latestReleaseUrl),
  );
}
