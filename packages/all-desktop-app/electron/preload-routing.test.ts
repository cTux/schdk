import { describe, expect, it, vi } from 'vitest';
import {
  isEditorFrameUrl,
  sendCloseRequestToEditorFrames,
} from './preload-routing.js';

describe('isEditorFrameUrl', () => {
  it('allows only the editor child frame', () => {
    expect(
      isEditorFrameUrl(new URL('file:///C:/app/apps/editor/index.html'), false),
    ).toBe(true);
    expect(isEditorFrameUrl(new URL('http://127.0.0.1:5175'), false)).toBe(
      true,
    );
    expect(
      isEditorFrameUrl(new URL('file:///C:/app/apps/host/index.html'), false),
    ).toBe(false);
    expect(isEditorFrameUrl(new URL('http://127.0.0.1:5175'), true)).toBe(
      false,
    );
  });
});

describe('sendCloseRequestToEditorFrames', () => {
  it('targets only loaded editor child frames', () => {
    const shell = {
      url: 'file:///C:/app/index.html',
      send: vi.fn(),
      framesInSubtree: [] as Array<{
        url: string;
        send: ReturnType<typeof vi.fn>;
      }>,
    };
    const host = {
      url: 'file:///C:/app/apps/host/index.html',
      send: vi.fn(),
    };
    const editor = {
      url: 'file:///C:/app/apps/editor/index.html',
      send: vi.fn(),
    };
    shell.framesInSubtree = [shell, host, editor];

    expect(sendCloseRequestToEditorFrames(shell, 3)).toBe(true);
    expect(shell.send).not.toHaveBeenCalled();
    expect(host.send).not.toHaveBeenCalled();
    expect(editor.send).toHaveBeenCalledWith('close-requested', 3);
  });

  it('reports that no save acknowledgement is needed without an editor', () => {
    const shell = {
      url: 'file:///C:/app/index.html',
      send: vi.fn(),
      framesInSubtree: [] as Array<{
        url: string;
        send: ReturnType<typeof vi.fn>;
      }>,
    };
    shell.framesInSubtree = [shell];

    expect(sendCloseRequestToEditorFrames(shell, 1)).toBe(false);
    expect(shell.send).not.toHaveBeenCalled();
  });
});
