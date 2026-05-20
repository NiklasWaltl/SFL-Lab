import { useCallback, useEffect, useRef, useState } from "react";
import {
  fetchMarketPrices,
  type MarketPricesResponse,
  type ResourcePrices,
} from "../services/marketPrices";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: (MarketPricesResponse & { fetchedAt: number }) | null = null;

export interface UseMarketPricesResult {
  prices: ResourcePrices | null;
  loading: boolean;
  error: string | null;
  isLive: boolean;
  lastUpdated?: string;
  refresh: () => void;
}

export function useMarketPrices(): UseMarketPricesResult {
  const [prices, setPrices] = useState<ResourcePrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [fetchCount, setFetchCount] = useState(0);
  const requestIdRef = useRef(0);
  const forceRef = useRef(false);

  useEffect(() => {
    const force = forceRef.current;
    forceRef.current = false;

    const requestId = ++requestIdRef.current;

    Promise.resolve().then(() => {
      if (!force && cache && Date.now() - cache.fetchedAt < CACHE_TTL_MS) {
        if (requestId !== requestIdRef.current) return;

        setPrices(cache.prices);
        setIsLive(cache.isLive);
        setLastUpdated(cache.lastUpdated);
        setLoading(false);
        return;
      }

      setLoading(true);

      return fetchMarketPrices()
        .then((data) => {
          if (requestId !== requestIdRef.current) return;

          cache = { ...data, fetchedAt: Date.now() };
          setPrices(data.prices);
          setIsLive(data.isLive);
          setLastUpdated(data.lastUpdated);
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    });
  }, [fetchCount]);

  const refresh = useCallback(() => {
    forceRef.current = true;
    setFetchCount((count) => count + 1);
  }, []);

  return { prices, loading, error: null, isLive, lastUpdated, refresh };
}
