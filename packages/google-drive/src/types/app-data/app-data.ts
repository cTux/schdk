import { isDriveFileId } from '../../services/settings/settings.js';
import {
  DRIVE_API,
  uploadDriveFile,
  type DriveRequest,
} from '../../utils/client/drive-api.js';
import { GoogleDrivePreconditionError } from '../../errors/client/google-drive-precondition-error.js';

interface AppDataFile {
  id: string;
}

interface VersionedAppData<T = unknown> {
  etag: string;
  value: T;
}

function readEtag(response: Response) {
  const etag = response.headers.get('etag');
  if (!etag) throw new Error('Google Drive app data ETag is unavailable');
  return etag;
}

export class GoogleDriveAppData {
  constructor(private readonly request: DriveRequest) {}

  async load(name: string): Promise<unknown | null> {
    return (await this.loadVersioned(name))?.value ?? null;
  }

  async loadVersioned(name: string): Promise<VersionedAppData | null> {
    const file = await this.find(name);
    if (!file) return null;
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(file.id)}?alt=media`,
    );
    return { etag: readEtag(response), value: await response.json() };
  }

  async save(name: string, value: unknown): Promise<void> {
    const file = await this.find(name);
    const metadata = file ? { name } : { name, parents: ['appDataFolder'] };
    await uploadDriveFile(this.request, {
      fileId: file?.id,
      metadata,
      mimeType: 'application/json',
      content: JSON.stringify(value),
    });
  }

  async saveVersioned(
    name: string,
    value: unknown,
    expectedEtag: string | null,
  ): Promise<boolean> {
    const file = await this.find(name);
    if (Boolean(file) !== Boolean(expectedEtag)) return false;
    const metadata = file ? { name } : { name, parents: ['appDataFolder'] };
    try {
      await uploadDriveFile(this.request, {
        fileId: file?.id,
        metadata,
        mimeType: 'application/json',
        content: JSON.stringify(value),
        ...(expectedEtag ? { headers: { 'If-Match': expectedEtag } } : {}),
      });
      return true;
    } catch (error) {
      if (error instanceof GoogleDrivePreconditionError) return false;
      throw error;
    }
  }

  private async find(name: string): Promise<AppDataFile | null> {
    const query = new URLSearchParams({
      spaces: 'appDataFolder',
      q: `name = '${name}' and trashed = false`,
      fields: 'files(id)',
      pageSize: '1',
    });
    const response = await this.request(`${DRIVE_API}/files?${query}`);
    const value = (await response.json()) as { files?: AppDataFile[] };
    const file = value.files?.[0];
    return file && isDriveFileId(file.id) ? file : null;
  }
}

export { type VersionedAppData };
