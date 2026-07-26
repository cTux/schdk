import {
  AI_MODELS,
  AI_PROVIDERS,
  DEFAULT_AI_MODEL,
  DEFAULT_AI_PROVIDER,
  type AiOptions,
  type AiProvider,
} from '@schdk/ui/options';
import { useEffect, useState } from 'react';

const PROVIDER_KEY = 'schdk.ai.provider';
const MODEL_KEY = 'schdk.ai.model';
const API_KEY = 'schdk.ai.api-key';

function loadProvider(): AiProvider {
  const provider = localStorage.getItem(PROVIDER_KEY);
  return AI_PROVIDERS.includes(provider as AiProvider)
    ? (provider as AiProvider)
    : DEFAULT_AI_PROVIDER;
}

function loadModel(provider: AiProvider) {
  const model = localStorage.getItem(MODEL_KEY);
  return (AI_MODELS[provider] as readonly string[]).includes(model ?? '')
    ? model!
    : provider === DEFAULT_AI_PROVIDER
      ? DEFAULT_AI_MODEL
      : AI_MODELS[provider][0];
}

function hasBrowserApiKey() {
  return Boolean(sessionStorage.getItem(API_KEY));
}

export function useAiSettings() {
  const [options, setOptions] = useState<AiOptions>(() => {
    const provider = loadProvider();
    return {
      provider,
      model: loadModel(provider),
      apiKeyConfigured: hasBrowserApiKey(),
    };
  });

  useEffect(() => {
    const credentials = window.desktop?.aiCredentials;
    if (!credentials) return;
    let active = true;
    void credentials
      .hasApiKey()
      .then((apiKeyConfigured) => {
        if (active) setOptions((value) => ({ ...value, apiKeyConfigured }));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  function setProvider(provider: AiProvider) {
    const model = AI_MODELS[provider][0];
    localStorage.setItem(PROVIDER_KEY, provider);
    localStorage.setItem(MODEL_KEY, model);
    setOptions((value) => ({ ...value, provider, model }));
  }

  function setModel(model: string) {
    if (!(AI_MODELS[options.provider] as readonly string[]).includes(model))
      return;
    localStorage.setItem(MODEL_KEY, model);
    setOptions((value) => ({ ...value, model }));
  }

  async function saveApiKey(apiKey: string | null) {
    const credentials = window.desktop?.aiCredentials;
    if (credentials) {
      await credentials.saveApiKey(apiKey);
    } else if (apiKey) {
      sessionStorage.setItem(API_KEY, apiKey);
    } else {
      sessionStorage.removeItem(API_KEY);
    }
    setOptions((value) => ({
      ...value,
      apiKeyConfigured: Boolean(apiKey),
    }));
  }

  return { options, setProvider, setModel, saveApiKey };
}
