import { useEffect, useState } from "react";
import { fetchPlayerData, getMockPlayerData } from "../services/playerApi";
import type { PlayerData } from "../types";
import { useJwt } from "./useJwt";

export interface UsePlayerDataResult {
  jwt: string | null;
  setJwt: (token: string | null) => void;
  playerData: PlayerData | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  fetchedAt: Date | null;
}

export function usePlayerData(): UsePlayerDataResult {
  const { jwt, setJwt } = useJwt();
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [fetchedAt, setFetchedAt] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      if (!jwt) {
        if (!cancelled) {
          setPlayerData(getMockPlayerData());
          setIsMock(true);
          setFetchedAt(new Date());
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchPlayerData(jwt);
        if (!cancelled) {
          setPlayerData(data);
          setIsMock(false);
          setFetchedAt(new Date());
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unbekannter Fehler");
          setPlayerData(null);
          setIsMock(false);
          setFetchedAt(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [jwt]);

  return { jwt, setJwt, playerData, loading, error, isMock, fetchedAt };
}
