/// <reference lib="dom" />

import { ipcRenderer, type IpcRendererEvent } from 'electron';

interface PresenterNotes {
  questionNumber: number;
  questionCount: number;
  notes: string;
}

let presenterNotes: PresenterNotes | null = null;

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

function renderPresenterNotes() {
  if (!presenterNotes) return;
  const position = document.getElementById('position');
  const notes = document.getElementById('notes');
  if (!position || !notes) return;
  position.textContent = `Питання ${presenterNotes.questionNumber} із ${presenterNotes.questionCount}`;
  notes.textContent = presenterNotes.notes;
}

ipcRenderer.on(
  'presenter-notes-updated',
  (_event: IpcRendererEvent, value: unknown) => {
    if (!isPresenterNotes(value)) return;
    presenterNotes = value;
    renderPresenterNotes();
  },
);

window.addEventListener('DOMContentLoaded', renderPresenterNotes, {
  once: true,
});
