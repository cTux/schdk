import { serializeGamePackage, type GamePackage } from '@schdk/common';
import { saveWithPicker } from './browser-save';

export interface LocalPackageSave {
  content: Uint8Array;
  filePath: string | null;
  name: string;
}

export async function savePackageLocally(
  gamePackage: GamePackage,
  suggestedName: string,
  description: string,
): Promise<LocalPackageSave | null> {
  const content = serializeGamePackage(gamePackage);
  if (window.desktop) {
    const filePath = await window.desktop.saveGamePackage(
      suggestedName,
      content,
    );
    if (!filePath) return null;
    const pathParts = filePath.split(/[\\/]/u);
    return {
      content,
      filePath,
      name: pathParts[pathParts.length - 1] || suggestedName,
    };
  }
  if (window.showSaveFilePicker) {
    const name = await saveWithPicker(
      window.showSaveFilePicker.bind(window),
      suggestedName,
      content,
      description,
    );
    return name ? { content, filePath: null, name } : null;
  }
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(content)], { type: 'application/zip' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  link.click();
  URL.revokeObjectURL(url);
  return { content, filePath: null, name: suggestedName };
}
