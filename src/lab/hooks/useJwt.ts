import { useCallback, useState } from "react";
import { getJwtFromUrl } from "../services/playerApi";

const JWT_STORAGE_KEY = "sfl_lab_jwt";

export interface UseJwtResult {
  jwt: string | null;
  setJwt: (token: string | null) => void;
}

function getInitialJwt(): string | null {
  const urlJwt = getJwtFromUrl();

  if (urlJwt) {
    return urlJwt;
  }

  return localStorage.getItem(JWT_STORAGE_KEY);
}

export function useJwt(): UseJwtResult {
  const [jwt, setJwtState] = useState<string | null>(() => getInitialJwt());

  const setJwt = useCallback((token: string | null) => {
    setJwtState(token);

    if (token) {
      localStorage.setItem(JWT_STORAGE_KEY, token);
      return;
    }

    localStorage.removeItem(JWT_STORAGE_KEY);
  }, []);

  return { jwt, setJwt };
}
