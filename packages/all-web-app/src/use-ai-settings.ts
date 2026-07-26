import type { AiOptions } from '@schdk/ui/options';
import { useEffect, useState } from 'react';

const PROVIDER_MODEL_KEY = 'schdk.ai.provider-model';
const API_KEY = 'schdk.ai.api-key';
const DEFAULT_PROVIDER_MODEL = 'openai:gpt-5';

function loadProviderModel() {
  return localStorage.getItem(PROVIDER_MODEL_KEY) || DEFAULT_PROVIDER_MODEL;
}

function hasBrowserApiKey() {
  return Boolean(sessionStorage.getItem(API_KEY));
}

export function useAiSettings() {
  const [options, setOptions] = useState<AiOptions>(() => ({
    providerModel: loadProviderModel(),
    apiKeyConfigured: hasBrowserApiKey(),
  }));

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

  function setProviderModel(providerModel: string) {
    localStorage.setItem(PROVIDER_MODEL_KEY, providerModel);
    setOptions((value) => ({ ...value, providerModel }));
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

  return { options, setProviderModel, saveApiKey };
}
