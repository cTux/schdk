import { isDriveFileId } from '../../services/settings/settings.js';
import { createDriveMultipartBody } from '../../utils/client/create-drive-multipart-body.js';

const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3';

interface AppDataFile {
  id: string;
}

type DriveRequest = (input: string, init?: RequestInit) => Promise<Response>;

export class GoogleDriveAppData {
  constructor(private readonly request: DriveRequest) {}

  async load(name: string): Promise<unknown | null> {
    const file = await this.find(name);
    if (!file) return null;
    const response = await this.request(
      `${DRIVE_API}/files/${encodeURIComponent(file.id)}?alt=media`,
    );
    return response.json();
  }

  async save(name: string, value: unknown): Promise<void> {
    const file = await this.find(name);
    const metadata = file ? { name } : { name, parents: ['appDataFolder'] };
    const { body, contentType } = createDriveMultipartBody(
      metadata,
      'application/json',
      JSON.stringify(value),
    );
    const target = file
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(file.id)}?uploadType=multipart`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart`;
    await this.request(target, {
      method: file ? 'PATCH' : 'POST',
      headers: { 'Content-Type': contentType },
      body,
    });
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
