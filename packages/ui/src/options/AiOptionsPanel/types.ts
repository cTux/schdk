import type { AiOptions } from '../types';

export interface AiOptionsPanelProps {
  options: AiOptions;
  onProviderChange(provider: string): void;
  onModelChange(model: string): void;
  onApiKeySave(apiKey: string | null): Promise<void>;
}
