import { type SupportedAiProvider } from './supported-ai-provider.js';
import { SUPPORTED_AI_PROVIDER_IDS } from './supported-ai-provider-ids.js';

export function isSupportedAiProvider(
  value: string,
): value is SupportedAiProvider {
  return SUPPORTED_AI_PROVIDER_IDS.includes(value as SupportedAiProvider);
}
