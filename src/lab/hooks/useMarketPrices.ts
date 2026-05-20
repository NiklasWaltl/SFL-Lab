import { useCallback, useEffect, useRef, useState } from "react";
import type { MarketPriceMap, MarketPricesResponse } from "../types";
import { fetchMarketPrices } from "../services/marketPrices";

const CACHE_TTL_MS = 5 * 60 * 1000;

let cache: (MarketPricesResponse & { fetchedAt: number }) | null = null;

export interface UseMarketPricesResult {
  prices: MarketPriceMap | null;
  loading: boolean;
  error: string | null;
  isLive: boolean;
  lastUpdated?: string;
  fetchedAt?: Date;
  isPriceManuallyOverridden: boolean;
  markPriceManuallyOverridden: () => void;
  refresh: (force?: boolean) => void;
}

export function useMarketPrices(): UseMarketPricesResult {
  const [prices, setPrices] = useState<ResourcePrices | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLive, setIsLive] = useState(false);
  const [isPriceManuallyOverridden, setIsPriceManuallyOverridden] =
    useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | undefined>();
  const [fetchedAt, setFetchedAt] = useState<Date | undefined>();
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
        setFetchedAt(cache.isLive ? new Date(cache.fetchedAt) : undefined);
        setError(cache.errorMessage ?? null);
        setLoading(false);
        return;
      }

      setLoading(true);

      return fetchMarketPrices()
        .then((data) => {
          if (requestId !== requestIdRef.current) return;

          const nextFetchedAt = new Date();
          cache = { ...data, fetchedAt: nextFetchedAt.getTime() };
          setPrices(data.prices);
          setIsLive(data.isLive);
          setLastUpdated(data.lastUpdated);
          setFetchedAt(data.isLive ? nextFetchedAt : undefined);
          setError(data.errorMessage ?? null);
          if (force) {
            setIsPriceManuallyOverridden(false);
          }
        })
        .catch(() => {
          if (requestId !== requestIdRef.current) return;
          setError("Marktpreise nicht erreichbar – Fallback aktiv");
        })
        .finally(() => {
          if (requestId === requestIdRef.current) {
            setLoading(false);
          }
        });
    });
  }, [fetchCount]);

  const refresh = useCallback((force = true) => {
    forceRef.current = force;
    setFetchCount((count) => count + 1);
  }, []);

  useEffect(() => {
    if (isPriceManuallyOverridden) return;

    const id = setInterval(() => refresh(true), CACHE_TTL_MS);
    return () => clearInterval(id);
  }, [isPriceManuallyOverridden, refresh]);

  const markPriceManuallyOverridden = useCallback(() => {
    setIsPriceManuallyOverridden(true);
  }, []);

  return {
    prices,
    loading,
    error,
    isLive,
    lastUpdated,
    fetchedAt,
    isPriceManuallyOverridden,
    markPriceManuallyOverridden,
    refresh,
  };
}
