import { Models, type ProviderMap } from '@opencode-ai/models';
import { isSupportedAiProvider } from '@schdk/ai';
import type { AiOptions, AiProviderOption } from '@schdk/ui/options';
import { useEffect, useState } from 'react';
import type { AiCredentialsPort } from '../../types/google-drive/google-drive-types';

const PROVIDER_KEY = 'schdk.ai.provider';
const MODEL_KEY = 'schdk.ai.model';
const LEGACY_API_KEY = 'schdk.ai.api-key';
const DEFAULT_PROVIDER = 'openai';
const DEFAULT_MODEL = 'gpt-5.2';
const FALLBACK_PROVIDERS: AiProviderOption[] = [
  {
    id: DEFAULT_PROVIDER,
    name: 'OpenAI',
    models: [
      { id: DEFAULT_MODEL, name: 'GPT-5.2' },
      { id: 'gpt-5-mini', name: 'GPT-5 mini' },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: [
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6' },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5' },
    ],
  },
  {
    id: 'google',
    name: 'Google',
    models: [
      { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
      { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash' },
    ],
  },
];

function toProviderOptions(providers: ProviderMap): AiProviderOption[] {
  return Object.values(providers)
    .filter(({ id }) => isSupportedAiProvider(id))
    .map(({ id, name, models }) => ({
      id,
      name,
      models: Object.values(models)
        .filter(
          ({ modalities, status }) =>
            status !== 'deprecated' &&
            modalities.input.includes('text') &&
            modalities.output.includes('text'),
        )
        .map(({ id: modelId, name: modelName }) => ({
          id: modelId,
          name: modelName,
        }))
        .sort((left, right) => left.name.localeCompare(right.name)),
    }))
    .filter(({ models }) => models.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name));
}

async function loadProviders() {
  try {
    const providers = toProviderOptions(await Models.make().providers());
    return providers.length ? providers : FALLBACK_PROVIDERS;
  } catch {
    return FALLBACK_PROVIDERS;
  }
}

function reconcileOptions(
  options: AiOptions,
  providers: AiProviderOption[],
): AiOptions {
  const provider =
    providers.find(({ id }) => id === options.provider) ??
    providers.find(({ id }) => id === DEFAULT_PROVIDER) ??
    providers[0];
  const model =
    provider.models.find(({ id }) => id === options.model) ??
    provider.models[0];
  return { ...options, providers, provider: provider.id, model: model.id };
}

function loadLegacyBrowserApiKey() {
  try {
    return sessionStorage.getItem(LEGACY_API_KEY);
  } catch {
    return null;
  }
}

function clearLegacyBrowserApiKey() {
  try {
    sessionStorage.removeItem(LEGACY_API_KEY);
  } catch {
    // An unavailable legacy store does not affect Drive persistence.
  }
}

export function useAiSettings(
  credentials: AiCredentialsPort | null,
  accountId?: string,
) {
  const [options, setOptions] = useState<AiOptions>(() => ({
    providers: FALLBACK_PROVIDERS,
    provider: localStorage.getItem(PROVIDER_KEY) ?? DEFAULT_PROVIDER,
    model: localStorage.getItem(MODEL_KEY) ?? DEFAULT_MODEL,
    apiKeyConfigured: false,
  }));

  useEffect(() => {
    let active = true;
    void loadProviders().then((providers) => {
      if (active) setOptions((value) => reconcileOptions(value, providers));
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    localStorage.setItem(PROVIDER_KEY, options.provider);
    localStorage.setItem(MODEL_KEY, options.model);
  }, [options.model, options.provider]);

  useEffect(() => {
    setOptions((value) => ({ ...value, apiKeyConfigured: false }));
    if (!credentials || !accountId) return;
    let active = true;
    const legacyApiKey = loadLegacyBrowserApiKey();
    const configured = legacyApiKey
      ? credentials.saveAiApiKey(legacyApiKey).then(() => {
          clearLegacyBrowserApiKey();
          return true;
        })
      : credentials.hasAiApiKey();
    void configured
      .then((apiKeyConfigured) => {
        if (active) setOptions((value) => ({ ...value, apiKeyConfigured }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [accountId, credentials]);

  function setProvider(provider: string) {
    const selected = options.providers.find(({ id }) => id === provider);
    if (!selected) return;
    setOptions((value) => ({
      ...value,
      provider,
      model: selected.models[0].id,
    }));
  }

  function setModel(model: string) {
    const models = options.providers.find(
      ({ id }) => id === options.provider,
    )?.models;
    if (!models?.some(({ id }) => id === model)) return;
    setOptions((value) => ({ ...value, model }));
  }

  async function saveApiKey(apiKey: string | null) {
    if (!credentials || !accountId) {
      throw new Error('Google Drive is disconnected');
    }
    await credentials.saveAiApiKey(apiKey);
    setOptions((value) => ({
      ...value,
      apiKeyConfigured: Boolean(apiKey),
    }));
  }

  return { options, setProvider, setModel, saveApiKey };
}
