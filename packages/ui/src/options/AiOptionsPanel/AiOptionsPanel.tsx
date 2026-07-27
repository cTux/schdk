import './styles.scss';

import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { Dropdown } from '../../atoms/Dropdown';
import { Input } from '../../atoms/Input';
import { useLocalization } from '../../localization';
import type { AiOptionsPanelProps } from './types';

export function AiOptionsPanel({
  options,
  onProviderChange,
  onModelChange,
  onApiKeySave,
}: AiOptionsPanelProps) {
  const { copy } = useLocalization();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const models =
    options.providers.find(({ id }) => id === options.provider)?.models ?? [];

  async function saveApiKey(value: string | null) {
    setSaving(true);
    setFailed(false);
    try {
      await onApiKeySave(value);
      setApiKey('');
    } catch {
      setFailed(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="ai-options">
      <div className="option-select">
        <span>
          <strong>{copy.settings.aiProviderModel}</strong>
          <small>{copy.settings.aiProviderModelDescription}</small>
        </span>
        <div className="ai-model-selects">
          <label className="ai-provider-select">
            <small>{copy.settings.aiProvider}</small>
            <Dropdown
              value={options.provider}
              onChange={(event) => onProviderChange(event.target.value)}
            >
              {options.providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.name}
                </option>
              ))}
            </Dropdown>
          </label>
          <label className="ai-model-select">
            <small>{copy.settings.aiModel}</small>
            <Dropdown
              value={options.model}
              onChange={(event) => onModelChange(event.target.value)}
            >
              {models.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name}
                </option>
              ))}
            </Dropdown>
          </label>
        </div>
      </div>
      <form
        className="option-select"
        onSubmit={(event) => {
          event.preventDefault();
          void saveApiKey(apiKey.trim());
        }}
      >
        <span>
          <strong>{copy.settings.aiApiKey}</strong>
          <small>{copy.settings.aiApiKeyDescription}</small>
          <small
            className={
              !failed && options.apiKeyConfigured ? 'configured' : undefined
            }
            aria-live="polite"
          >
            {failed
              ? copy.settings.aiApiKeySaveFailed
              : options.apiKeyConfigured
                ? copy.settings.aiApiKeyConfigured
                : copy.settings.aiApiKeyMissing}
          </small>
        </span>
        <div className="ai-api-key-control">
          <Input
            type="password"
            value={apiKey}
            placeholder={
              options.apiKeyConfigured
                ? '********'
                : copy.settings.aiApiKeyPlaceholder
            }
            autoComplete="off"
            onChange={(event) => setApiKey(event.target.value)}
          />
          <Button type="submit" disabled={saving || !apiKey.trim()}>
            {copy.settings.aiApiKeySave}
          </Button>
          {options.apiKeyConfigured && (
            <Button
              type="button"
              variant="ghost"
              disabled={saving}
              onClick={() => void saveApiKey(null)}
            >
              {copy.settings.aiApiKeyRemove}
            </Button>
          )}
        </div>
      </form>
    </section>
  );
}
