import { type AiProviderOption } from './ai-provider-option';

export interface AiOptions {
  providers: AiProviderOption[];
  provider: string;
  model: string;
  apiKeyConfigured: boolean;
}
