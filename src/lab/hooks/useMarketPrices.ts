import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchMarketPrices,
  type ResourcePrices,
} from "../services/marketPrices";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: { prices: ResourcePrices; fetchedAt: number } | null = null;

export interface UseMarketPricesResult {
  prices: ResourcePrices | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useMarketPrices(): UseMarketPricesResult {
  const [prices, setPrices] = useState<ResourcePrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const doFetch = useCallback(async (force: boolean) => {
    if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
      setPrices(cache.prices);
      setLoading(false);
      setError(null);
      return;
    }

    const requestId = ++requestIdRef.current;
    setLoading(true);
    setError(null);

    try {
      const data = await fetchMarketPrices();
      if (requestId !== requestIdRef.current) return;

      cache = { prices: data, fetchedAt: Date.now() };
      setPrices(data);
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void doFetch(false);
  }, [doFetch]);

  const refresh = useCallback(() => {
    void doFetch(true);
  }, [doFetch]);

  return { prices, loading, error, refresh };
}
