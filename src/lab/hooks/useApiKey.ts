import { useCallback, useState } from "react";

const API_KEY_STORAGE_KEY = "sfl_lab_api_key";

export interface UseApiKeyResult {
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
}

function getApiKeyFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("apiKey");
}

function getInitialApiKey(): string | null {
  const urlApiKey = getApiKeyFromUrl();

  if (urlApiKey) {
    return urlApiKey;
  }

  return localStorage.getItem(API_KEY_STORAGE_KEY);
}

export function useApiKey(): UseApiKeyResult {
  const [apiKey, setApiKeyState] = useState<string | null>(() =>
    getInitialApiKey(),
  );

  const setApiKey = useCallback((key: string | null) => {
    setApiKeyState(key);

    if (key) {
      localStorage.setItem(API_KEY_STORAGE_KEY, key);
      return;
    }

    localStorage.removeItem(API_KEY_STORAGE_KEY);
  }, []);

  return { apiKey, setApiKey };
}
