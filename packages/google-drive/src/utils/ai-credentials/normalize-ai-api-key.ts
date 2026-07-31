import { MAX_AI_API_KEY_LENGTH } from '../../constants/ai-credentials/max-ai-api-key-length.js';

export function normalizeAiApiKey(value: unknown) {
  if (value === null) return null;
  if (typeof value !== 'string') throw new TypeError('Invalid AI API key');
  const apiKey = value.trim();
  if (!apiKey || apiKey.length > MAX_AI_API_KEY_LENGTH) {
    throw new TypeError('Invalid AI API key');
  }
  return apiKey;
}
