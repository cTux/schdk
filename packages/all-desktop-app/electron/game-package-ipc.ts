import { app, dialog, ipcMain } from 'electron';
import { readFile, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

const RECENT_LIMIT = 20;
const editableGamePackages = new Set<string>();
let recentGamePackages: string[] = [];

const recentGamePackagesPath = () =>
  join(app.getPath('userData'), 'recent-game-packages.json');

async function persistRecentGamePackages() {
  try {
    await writeFile(
      recentGamePackagesPath(),
      JSON.stringify(recentGamePackages),
    );
  } catch {
    // A package operation must not fail only because the recent list cannot persist.
  }
}

async function rememberGamePackage(filePath: string) {
  recentGamePackages = [
    filePath,
    ...recentGamePackages.filter((path) => path !== filePath),
  ].slice(0, RECENT_LIMIT);
  await persistRecentGamePackages();
}

async function forgetGamePackage(filePath: string) {
  recentGamePackages = recentGamePackages.filter((path) => path !== filePath);
  await persistRecentGamePackages();
}

async function readGamePackage(filePath: string, editable: boolean) {
  const content = await readFile(filePath);
  if (editable) editableGamePackages.add(filePath);
  await rememberGamePackage(filePath);
  return {
    filePath,
    fileName: basename(filePath),
    content: new Uint8Array(content),
  };
}

export function hasEditableGamePackages() {
  return editableGamePackages.size > 0;
}

export async function loadRecentGamePackages() {
  try {
    const value: unknown = JSON.parse(
      await readFile(recentGamePackagesPath(), 'utf8'),
    );
    recentGamePackages = Array.isArray(value)
      ? value.filter(
          (path): path is string =>
            typeof path === 'string' && /\.schdk$/iu.test(path),
        )
      : [];
  } catch {
    recentGamePackages = [];
  }
}

export function registerGamePackageIpc() {
  ipcMain.handle('save-game-package', async (_event, filename, content) => {
    if (typeof filename !== 'string' || !(content instanceof Uint8Array)) {
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
    editableGamePackages.add(filePath);
    await rememberGamePackage(filePath);
    return filePath;
  });

  ipcMain.handle('open-game-package', async (_event, filePath) => {
    if (typeof filePath !== 'string' || !/\.schdk$/iu.test(filePath)) {
      throw new TypeError('Invalid file path');
    }
    return readGamePackage(filePath, true);
  });

  ipcMain.handle('open-host-game-package', async (_event, filePath) => {
    if (typeof filePath !== 'string' || !/\.schdk$/iu.test(filePath)) {
      throw new TypeError('Invalid file path');
    }
    return readGamePackage(filePath, false);
  });

  ipcMain.handle('list-recent-game-packages', async () => {
    const packages = await Promise.all(
      recentGamePackages.map(async (filePath) => {
        try {
          return {
            filePath,
            fileName: basename(filePath),
            content: new Uint8Array(await readFile(filePath)),
          };
        } catch {
          return null;
        }
      }),
    );
    const availablePackages = packages.filter(
      (gamePackage) => gamePackage !== null,
    );
    if (availablePackages.length !== recentGamePackages.length) {
      recentGamePackages = availablePackages.map(({ filePath }) => filePath);
      await persistRecentGamePackages();
    }
    return availablePackages;
  });

  const openRecent = async (filePath: unknown, editable: boolean) => {
    if (
      typeof filePath !== 'string' ||
      !recentGamePackages.includes(filePath)
    ) {
      throw new TypeError('Invalid recent game package');
    }
    try {
      return await readGamePackage(filePath, editable);
    } catch (error) {
      await forgetGamePackage(filePath);
      throw error;
    }
  };
  ipcMain.handle('open-recent-game-package', (_event, filePath) =>
    openRecent(filePath, true),
  );
  ipcMain.handle('open-recent-host-game-package', (_event, filePath) =>
    openRecent(filePath, false),
  );

  ipcMain.handle('write-game-package', async (_event, filePath, content) => {
    if (
      typeof filePath !== 'string' ||
      !(content instanceof Uint8Array) ||
      !editableGamePackages.has(filePath)
    ) {
      throw new TypeError('Invalid game package');
    }
    await writeFile(filePath, content);
  });
}
