import { isDriveFileId } from './settings.js';

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
    const boundary = `schdk-${crypto.randomUUID()}`;
    const body = new Blob([
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n`,
      JSON.stringify(metadata),
      `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n`,
      JSON.stringify(value),
      `\r\n--${boundary}--`,
    ]);
    const target = file
      ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(file.id)}?uploadType=multipart`
      : `${DRIVE_UPLOAD_API}/files?uploadType=multipart`;
    await this.request(target, {
      method: file ? 'PATCH' : 'POST',
      headers: {
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
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
