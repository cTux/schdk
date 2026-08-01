import { afterEach, describe, expect, it, vi } from 'vitest';
import { createEmptyGamePackage, serializeGamePackage } from '@schdk/common';
import {
  GoogleDriveAuthorizationError,
  GoogleDriveClient,
} from '../../services/client/client.js';

const jsonResponse = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const packageFile = {
  id: 'package-id',
  name: 'Test.schdk',
  modifiedTime: '2026-07-26T00:00:00.000Z',
  appProperties: {
    schdkType: 'game-package',
    ready: 'false',
    hasRemarks: 'false',
  },
};

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('GoogleDriveClient', () => {
  it('V41: discovers the package folder again after an account switch', async () => {
    let token = 'account-a';
    const uploads: string[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
        const url = String(input);
        const authorization = new Headers(init?.headers).get('Authorization');
        if (url.startsWith('https://www.googleapis.com/drive/v3/files?')) {
          return jsonResponse({
            files: [
              {
                id:
                  authorization === 'Bearer account-a'
                    ? 'folder-a'
                    : 'folder-b',
              },
            ],
          });
        }
        const body = init?.body;
        if (!(body instanceof Blob)) throw new TypeError('Missing upload body');
        uploads.push(await body.text());
        return jsonResponse(packageFile);
      }),
    );
    const client = new GoogleDriveClient(async () => token);
    const gamePackage = createEmptyGamePackage();
    gamePackage.title = 'Test';
    const value = {
      name: 'Test.schdk',
      title: 'Test',
      content: serializeGamePackage(gamePackage),
      ready: false,
      hasRemarks: false,
    };

    await client.createGamePackage(value);
    token = 'account-b';
    await client.createGamePackage(value);
    token = 'account-a';
    await client.createGamePackage(value);

    expect(uploads[0]).toContain('"parents":["folder-a"]');
    expect(uploads[1]).toContain('"parents":["folder-b"]');
    expect(uploads[2]).toContain('"parents":["folder-a"]');
  });

  it('reports expired authorization', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(null, { status: 401 })),
    );
    const client = new GoogleDriveClient(async () => 'expired');

    await expect(client.listGamePackages()).rejects.toMatchObject({
      code: 'authorization',
      name: 'GoogleDriveAuthorizationError',
    });
  });

  it('rejects global writes from non-admin accounts', async () => {
    const fetchMock = vi.fn(async () =>
      jsonResponse({
        user: { displayName: 'Player', emailAddress: 'player@example.com' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new GoogleDriveClient(async () => 'token');

    await expect(
      client.createGlobalAIQuestion({
        name: 'Global question',
        content: Uint8Array.from([1]),
      }),
    ).rejects.toBeInstanceOf(GoogleDriveAuthorizationError);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it('lists every page of packages', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: string | URL | Request) => {
        const url = new URL(String(input));
        if (url.searchParams.get('q')?.startsWith('mimeType')) {
          return jsonResponse({ files: [{ id: 'folder-id' }] });
        }
        return jsonResponse(
          url.searchParams.get('pageToken')
            ? { files: [{ ...packageFile, id: 'package-2' }] }
            : { files: [packageFile], nextPageToken: 'page-2' },
        );
      }),
    );

    const files = await new GoogleDriveClient(
      async () => 'token',
    ).listGamePackages();

    expect(files.map(({ id }) => id)).toEqual(['package-id', 'package-2']);
  });
});
