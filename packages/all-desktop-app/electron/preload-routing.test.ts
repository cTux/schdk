import { describe, expect, it } from 'vitest';
import { isEditorFrameUrl } from './preload-routing.js';

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
