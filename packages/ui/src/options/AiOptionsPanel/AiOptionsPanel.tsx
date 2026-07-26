import './styles.scss';

import { useState } from 'react';
import { Button } from '../../atoms/Button';
import { useLocalization } from '../../localization';
import type { AiOptionsPanelProps } from './types';

export function AiOptionsPanel({
  options,
  onProviderModelChange,
  onApiKeySave,
}: AiOptionsPanelProps) {
  const { copy } = useLocalization();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

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
      <label className="option-select">
        <span>
          <strong>{copy.settings.aiProviderModel}</strong>
          <small>{copy.settings.aiProviderModelDescription}</small>
        </span>
        <input
          type="text"
          value={options.providerModel}
          spellCheck={false}
          onChange={(event) => onProviderModelChange(event.target.value)}
        />
      </label>
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
          <small aria-live="polite">
            {failed
              ? copy.settings.aiApiKeySaveFailed
              : options.apiKeyConfigured
                ? copy.settings.aiApiKeyConfigured
                : copy.settings.aiApiKeyMissing}
          </small>
        </span>
        <div className="ai-api-key-control">
          <input
            type="password"
            value={apiKey}
            placeholder={copy.settings.aiApiKeyPlaceholder}
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
