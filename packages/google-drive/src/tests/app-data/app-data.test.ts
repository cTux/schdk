import { describe, expect, it, vi } from 'vitest';
import { GoogleDrivePreconditionError } from '../../errors/client/google-drive-precondition-error.js';
import { GoogleDriveAppData } from '../../types/app-data/app-data.js';

const jsonResponse = (value: unknown, etag?: string) =>
  new Response(JSON.stringify(value), {
    headers: {
      'Content-Type': 'application/json',
      ...(etag ? { ETag: etag } : {}),
    },
  });

describe('Google Drive app-data concurrency', () => {
  it('loads an ETag and requires it for the matching update', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'settings' }] }))
      .mockResolvedValueOnce(jsonResponse({ schemaVersion: 1 }, 'version-1'))
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'settings' }] }))
      .mockResolvedValueOnce(jsonResponse({}));
    const appData = new GoogleDriveAppData(request);

    await expect(appData.loadVersioned('settings.json')).resolves.toEqual({
      etag: 'version-1',
      value: { schemaVersion: 1 },
    });
    await expect(
      appData.saveVersioned('settings.json', { schemaVersion: 1 }, 'version-1'),
    ).resolves.toBe(true);
    expect(request.mock.calls[3]?.[1]?.headers).toMatchObject({
      'If-Match': 'version-1',
    });
  });

  it('returns a conflict instead of overwriting a changed file', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({ files: [{ id: 'settings' }] }))
      .mockRejectedValueOnce(new GoogleDrivePreconditionError());
    const appData = new GoogleDriveAppData(request);

    await expect(
      appData.saveVersioned('settings.json', {}, 'stale-version'),
    ).resolves.toBe(false);
  });
});
