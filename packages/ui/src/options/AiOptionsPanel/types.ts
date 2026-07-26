import type { AiOptions } from '../types';

export interface AiOptionsPanelProps {
  options: AiOptions;
  onProviderModelChange(providerModel: string): void;
  onApiKeySave(apiKey: string | null): Promise<void>;
}
