import { type ImageHandout } from '@schdk/common';

const MAX_HANDOUT_IMAGE_BYTES = 8 * 1024 * 1024;

export function readImageHandout(file: File): Promise<ImageHandout> {
  if (file.size > MAX_HANDOUT_IMAGE_BYTES || !file.type.startsWith('image/')) {
    return Promise.reject(new Error('Invalid handout image'));
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => {
      if (
        typeof reader.result !== 'string' ||
        !reader.result.startsWith(`data:${file.type};base64,`)
      ) {
        reject(new Error('Invalid handout image'));
        return;
      }
      resolve({
        kind: 'image',
        name: file.name,
        mimeType: file.type,
        dataUrl: reader.result,
      });
    });
    reader.addEventListener('error', () =>
      reject(new Error('Invalid handout image')),
    );
    reader.readAsDataURL(file);
  });
}
