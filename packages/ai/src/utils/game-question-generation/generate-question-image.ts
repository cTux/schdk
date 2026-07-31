import { createOpenAI } from '@ai-sdk/openai';
import { generateImage } from 'ai';
import { parseGameQuestion, type GameQuestion } from '@schdk/common';

const maxImageBytes = 8 * 1024 * 1024;

export async function generateQuestionImage(
  apiKey: string,
  question: GameQuestion,
  prompt: string,
): Promise<GameQuestion> {
  const { image } = await generateImage({
    model: createOpenAI({ apiKey }).image('gpt-image-2'),
    prompt,
    size: '1536x1024',
    providerOptions: {
      openai: {
        quality: 'medium',
        outputFormat: 'jpeg',
        outputCompression: 85,
      },
    },
  });
  if (image.uint8Array.byteLength > maxImageBytes) {
    throw new Error('Generated image exceeds the handout size limit');
  }
  return parseGameQuestion({
    ...question,
    handout: {
      kind: 'image',
      name: 'generated-handout.jpg',
      mimeType: image.mediaType,
      dataUrl: `data:${image.mediaType};base64,${image.base64}`,
    },
  });
}
