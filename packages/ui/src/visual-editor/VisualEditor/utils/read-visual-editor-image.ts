import { MAX_CUSTOM_IMAGE_DATA_LENGTH } from '../../../options/types';

export function readVisualEditorImage(file: File): Promise<string> {
  const prefix = `data:${file.type};base64,`;
  const maxBytes = Math.floor(
    ((MAX_CUSTOM_IMAGE_DATA_LENGTH - prefix.length) * 3) / 4,
  );
  if (!file.type.startsWith('image/') || file.size > maxBytes) {
    return Promise.reject(new Error('Invalid visual editor image'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const result = reader.result;
      if (
        typeof result !== 'string' ||
        !result.startsWith(prefix) ||
        result.length > MAX_CUSTOM_IMAGE_DATA_LENGTH
      ) {
        reject(new Error('Invalid visual editor image'));
        return;
      }
      resolve(result);
    });
    reader.addEventListener('error', () =>
      reject(new Error('Invalid visual editor image')),
    );
    reader.readAsDataURL(file);
  });
}
