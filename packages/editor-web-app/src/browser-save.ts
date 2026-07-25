export interface BrowserFileHandle {
  name: string;
  createWritable(): Promise<{
    write(content: Blob): Promise<void>;
    close(): Promise<void>;
  }>;
}

export type SaveFilePicker = (options: {
  suggestedName: string;
  types: Array<{
    description: string;
    accept: Record<string, string[]>;
  }>;
}) => Promise<BrowserFileHandle>;

export async function saveWithPicker(
  picker: SaveFilePicker,
  filename: string,
  content: Uint8Array,
  description = 'Пакет Що? Де? Коли?',
): Promise<string | null> {
  try {
    const handle = await picker({
      suggestedName: filename,
      types: [
        {
          description,
          accept: { 'application/zip': ['.schdk'] },
        },
      ],
    });
    const writable = await handle.createWritable();
    await writable.write(
      new Blob([new Uint8Array(content)], { type: 'application/zip' }),
    );
    await writable.close();
    return handle.name;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') return null;
    throw error;
  }
}
