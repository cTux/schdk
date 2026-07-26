import type { AiOptions, AiProvider } from '../types';

export interface AiOptionsPanelProps {
  options: AiOptions;
  onProviderChange(provider: AiProvider): void;
  onModelChange(model: string): void;
  onApiKeySave(apiKey: string | null): Promise<void>;
}
