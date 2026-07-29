import { type AiModelOption } from './ai-model-option';

export interface AiProviderOption {
  id: string;
  name: string;
  models: AiModelOption[];
}
