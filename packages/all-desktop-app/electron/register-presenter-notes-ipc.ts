import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { fileURLToPath } from 'node:url';
import { type PresenterNotes } from './presenter-notes-data.js';
import { presenterNotesState } from './presenter-notes-state.js';
import { closePresenterNotes } from './presenter-notes.js';

const PRESENTER_NOTES_HTML = `<!doctype html>
<html lang="uk">
  <head>
    <meta charset="UTF-8" />
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; style-src 'unsafe-inline'"
    />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>\u041f\u0440\u0438\u043c\u0456\u0442\u043a\u0438 \u0432\u0435\u0434\u0443\u0447\u043e\u0433\u043e</title>
    <style>
      :root {
        color: #f8fafc;
        background: #111827;
        font-family: Inter, system-ui, sans-serif;
      }
      body {
        box-sizing: border-box;
        min-height: 100vh;
        margin: 0;
        padding: 24px;
      }
      p { margin: 0; }
      #position {
        color: #94a3b8;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }
      #notes {
        margin-top: 18px;
        font-size: 20px;
        line-height: 1.5;
        white-space: pre-wrap;
      }
      #notes:empty::before {
        color: #64748b;
        content: '\u041f\u0440\u0438\u043c\u0456\u0442\u043e\u043a \u043d\u0435\u043c\u0430\u0454';
      }
    </style>
  </head>
  <body>
    <p id="position"></p>
    <p id="notes"></p>
  </body>
</html>`;

function isPresenterNotes(value: unknown): value is PresenterNotes {
  if (!value || typeof value !== 'object') return false;
  const notes = value as Record<string, unknown>;
  return (
    Number.isSafeInteger(notes.questionNumber) &&
    Number(notes.questionNumber) > 0 &&
    Number.isSafeInteger(notes.questionCount) &&
    Number(notes.questionCount) >= Number(notes.questionNumber) &&
    typeof notes.notes === 'string'
  );
}

async function showPresenterNotes(mainWindow: BrowserWindow | null) {
  if (
    presenterNotesState.window ||
    presenterNotesState.dismissed ||
    !presenterNotesState.notes
  ) {
    return;
  }
  const mainDisplay = mainWindow
    ? screen.getDisplayMatching(mainWindow.getBounds())
    : screen.getPrimaryDisplay();
  const display =
    screen.getAllDisplays().find(({ id }) => id !== mainDisplay.id) ??
    mainDisplay;
  const width = 440;
  const height = 320;
  const window = new BrowserWindow({
    alwaysOnTop: true,
    autoHideMenuBar: true,
    width,
    height,
    minWidth: 320,
    minHeight: 220,
    show: false,
    x: display.workArea.x + display.workArea.width - width - 24,
    y: display.workArea.y + 24,
    webPreferences: {
      contextIsolation: true,
      devTools: !app.isPackaged,
      preload: fileURLToPath(
        new URL('./presenter-preload.cjs', import.meta.url),
      ),
    },
  });
  presenterNotesState.window = window;
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event) => event.preventDefault());
  window.on('closed', () => {
    if (presenterNotesState.window !== window) return;
    presenterNotesState.window = null;
    presenterNotesState.dismissed = true;
  });
  await window.loadURL(
    `data:text/html;charset=UTF-8,${encodeURIComponent(PRESENTER_NOTES_HTML)}`,
  );
  if (presenterNotesState.window !== window || window.isDestroyed()) return;
  if (presenterNotesState.notes) {
    window.webContents.send(
      'presenter-notes-updated',
      presenterNotesState.notes,
    );
  }
  window.showInactive();
}

export function registerPresenterNotesIpc(
  getMainWindow: () => BrowserWindow | null,
) {
  ipcMain.on('set-presenter-notes', (event, value: unknown) => {
    if (event.sender !== getMainWindow()?.webContents) return;
    if (value === null) {
      closePresenterNotes();
      return;
    }
    if (!isPresenterNotes(value)) return;
    presenterNotesState.notes = value;
    if (
      presenterNotesState.window &&
      !presenterNotesState.window.isDestroyed()
    ) {
      presenterNotesState.window.webContents.send(
        'presenter-notes-updated',
        value,
      );
    } else {
      void showPresenterNotes(getMainWindow());
    }
  });
}
