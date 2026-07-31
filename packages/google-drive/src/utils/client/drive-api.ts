import {
  DRIVE_APP_KIND_KEY,
  DRIVE_FOLDER_KIND,
  DRIVE_FOLDER_MIME_TYPE,
} from '../../services/game-packages/game-packages.js';
import { isDriveFileId } from '../../services/settings/settings.js';
import { createDriveMultipartBody } from './create-drive-multipart-body.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';
const PACKAGE_FOLDER_NAME = 'SCHDK';

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

interface DriveUpload {
  fileId?: string;
  fields?: string;
  metadata: unknown;
  mimeType: string;
  content: BlobPart;
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
    throw new Error('Google Drive package folder is unavailable');
  }
  return file.id;
}

function uploadDriveFile(
  request: DriveRequest,
  { fileId, fields, metadata, mimeType, content }: DriveUpload,
) {
  const multipart = createDriveMultipartBody(metadata, mimeType, content);
  const target = `${DRIVE_UPLOAD_API}/files${fileId ? `/${encodeURIComponent(fileId)}` : ''}?uploadType=multipart${fields ? `&fields=${fields}` : ''}`;
  return request(target, {
    method: fileId ? 'PATCH' : 'POST',
    headers: { 'Content-Type': multipart.contentType },
    body: multipart.body,
  });
}

export { DRIVE_API, ensurePackageFolder, uploadDriveFile, type DriveRequest };
