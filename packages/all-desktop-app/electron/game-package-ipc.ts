import { dialog, ipcMain } from 'electron';
import { writeFile } from 'node:fs/promises';

export function registerGamePackageIpc() {
  ipcMain.handle('save-game-package', async (_event, filename, content) => {
    if (
      typeof filename !== 'string' ||
      !/\.schdk$/iu.test(filename) ||
      !(content instanceof Uint8Array)
    ) {
      throw new TypeError('Invalid game package');
    }
    const result = await dialog.showSaveDialog({
      defaultPath: filename,
      filters: [
        {
          name: '\u041f\u0430\u043a\u0435\u0442 \u0429\u043e? \u0414\u0435? \u041a\u043e\u043b\u0438?',
          extensions: ['schdk'],
        },
      ],
    });
    if (result.canceled || !result.filePath) return null;
    const filePath = /\.schdk$/iu.test(result.filePath)
      ? result.filePath
      : `${result.filePath}.schdk`;
    await writeFile(filePath, content);
    return filePath;
  });
}
