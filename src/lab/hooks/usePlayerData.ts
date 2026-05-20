import { useEffect, useState } from "react";
import { fetchPublicFarmData, getMockPlayerData } from "../services/playerApi";
import type { PlayerData } from "../types";
import { useApiKey } from "./useApiKey";
import { useFarmId } from "./useFarmId";

export interface UsePlayerDataResult {
  farmId: number | null;
  setFarmId: (id: number | null) => void;
  apiKey: string | null;
  setApiKey: (key: string | null) => void;
  playerData: PlayerData | null;
  loading: boolean;
  error: string | null;
  isMock: boolean;
  fetchedAt: Date | null;
}

export function usePlayerData(): UsePlayerDataResult {
  const { farmId, setFarmId } = useFarmId();
  const { apiKey, setApiKey } = useApiKey();
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

      if (!farmId || !apiKey) {
        if (!cancelled) {
          setPlayerData(getMockPlayerData());
          setIsMock(true);
          setFetchedAt(new Date());
          setLoading(false);
        }
        return;
      }

      try {
        const data = await fetchPublicFarmData(farmId, apiKey);
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
  }, [farmId, apiKey]);

  return {
    farmId,
    setFarmId,
    apiKey,
    setApiKey,
    playerData,
    loading,
    error,
    isMock,
    fetchedAt,
  };
}
