import {
  DRIVE_APP_KIND_KEY,
  DRIVE_FOLDER_KIND,
  DRIVE_FOLDER_MIME_TYPE,
} from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';
import { GoogleDriveError } from '../../errors/client/google-drive-error.js';
import { createDriveMultipartBody } from './create-drive-multipart-body.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const PACKAGE_FOLDER_NAME = 'SCHDK';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

interface DriveUpload {
  fileId?: string;
  fields?: string;
  headers?: HeadersInit;
  metadata: unknown;
  mimeType: string;
  content: BlobPart;
}

async function listDriveFiles<T>(
  request: DriveRequest,
  query: URLSearchParams,
  parse: (value: unknown) => T | null,
): Promise<T[]> {
  const files: T[] = [];
  let pageToken: string | undefined;
  do {
    if (pageToken) query.set('pageToken', pageToken);
    const response = await request(`${DRIVE_API}/files?${query}`);
    const value = (await response.json()) as {
      files?: unknown[];
      nextPageToken?: string;
    };
    files.push(
      ...(value.files ?? []).flatMap((file) => {
        const parsed = parse(file);
        return parsed ? [parsed] : [];
      }),
    );
    pageToken = value.nextPageToken;
  } while (pageToken);
  return files;
}

async function loadDriveMetadata(
  request: DriveRequest,
  fileId: string,
  fields: string,
) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  const response = await request(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?fields=${fields}`,
  );
  return (await response.json()) as Record<string, unknown>;
}

async function downloadDriveFile(
  request: DriveRequest,
  fileId: string,
  maxBytes: number,
) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  const response = await request(
    `${DRIVE_API}/files/${encodeURIComponent(fileId)}?alt=media`,
  );
  const content = new Uint8Array(await response.arrayBuffer());
  return content.byteLength <= maxBytes ? content : null;
}

function hasValidDriveSize(value: unknown, maxBytes: number, minimumBytes = 1) {
  const size = Number(value);
  return (
    typeof value === 'string' &&
    Number.isSafeInteger(size) &&
    size >= minimumBytes &&
    size <= maxBytes
  );
}

function trashDriveFile(request: DriveRequest, fileId: string) {
  if (!isDriveFileId(fileId)) throw new TypeError('Invalid Google Drive file');
  return request(`${DRIVE_API}/files/${encodeURIComponent(fileId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ trashed: true }),
  });
}

async function ensurePackageFolder(request: DriveRequest) {
  const query = new URLSearchParams({
    spaces: 'drive',
    q: `mimeType = '${DRIVE_FOLDER_MIME_TYPE}' and trashed = false and appProperties has { key='${DRIVE_APP_KIND_KEY}' and value='${DRIVE_FOLDER_KIND}' }`,
    fields: 'files(id)',
    pageSize: '1',
  });
  const response = await request(`${DRIVE_API}/files?${query}`);
  const value = (await response.json()) as { files?: { id?: unknown }[] };
  const existing = value.files?.[0]?.id;
  if (isDriveFileId(existing)) return existing;
  const created = await request(`${DRIVE_API}/files?fields=id`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: PACKAGE_FOLDER_NAME,
      mimeType: DRIVE_FOLDER_MIME_TYPE,
      appProperties: { [DRIVE_APP_KIND_KEY]: DRIVE_FOLDER_KIND },
    }),
  });
  const file = (await created.json()) as { id?: unknown };
  if (!isDriveFileId(file.id)) {
    throw new GoogleDriveError(
      'Google Drive package folder is unavailable',
      'unavailable',
    );
  }
  return file.id;
}

function uploadDriveFile(
  request: DriveRequest,
  { fileId, fields, headers, metadata, mimeType, content }: DriveUpload,
) {
  const multipart = createDriveMultipartBody(metadata, mimeType, content);
  const target = `${DRIVE_UPLOAD_API}/files${fileId ? `/${encodeURIComponent(fileId)}` : ''}?uploadType=multipart${fields ? `&fields=${fields}` : ''}`;
  return request(target, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': multipart.contentType, ...headers },
    body: multipart.body,
  });
}

export {
  DRIVE_API,
  downloadDriveFile,
  ensurePackageFolder,
  hasValidDriveSize,
  listDriveFiles,
  loadDriveMetadata,
  trashDriveFile,
  uploadDriveFile,
  type DriveRequest,
};
