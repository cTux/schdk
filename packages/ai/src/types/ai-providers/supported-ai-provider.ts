import { SUPPORTED_AI_PROVIDER_IDS } from '../../constants/ai-providers/supported-ai-provider-ids.js';

export type SupportedAiProvider = (typeof SUPPORTED_AI_PROVIDER_IDS)[number];
