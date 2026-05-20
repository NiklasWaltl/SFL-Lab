import { useCallback, useMemo, useState } from "react";
import type {
  Boost,
  ExperimentDelta,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import {
  calculateDelta,
  calculateResource,
  getActiveBoosts,
  sumExperimentBoostPrices,
} from "../utils/calculations";
import type { LabMode } from "./useLabState";

export function useExperiment(
  boosts: Boost[],
  resources: ResourceConfig[],
  globalParams: GlobalParams,
  actualResults: ResourceResult[],
) {
  const [experimentBoostIds, setExperimentBoostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [mode, setMode] = useState<LabMode>("actual");

  const clearBoostFromExperiment = useCallback((id: string) => {
    setExperimentBoostIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleExperimentBoost = useCallback(
    (id: string) => {
      const boost = boosts.find((b) => b.id === id);
      if (!boost || boost.owned) return;

      setExperimentBoostIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
    },
    [boosts],
  );

  const resetExperiment = useCallback(() => {
    setExperimentBoostIds(new Set());
    setMode("actual");
  }, []);

  const experimentActiveBoosts = useMemo(
    () => getActiveBoosts(boosts, experimentBoostIds, "experiment"),
    [boosts, experimentBoostIds],
  );

  const experimentResults: ResourceResult[] = useMemo(
    () =>
      resources.map((r) =>
        calculateResource(
          r,
          globalParams,
          experimentActiveBoosts,
          globalParams.marketPriceWood,
        ),
      ),
    [resources, globalParams, experimentActiveBoosts],
  );

  const experimentPrice = useMemo(
    () => sumExperimentBoostPrices(boosts, experimentBoostIds),
    [boosts, experimentBoostIds],
  );

  const deltas: ExperimentDelta[] = useMemo(
    () =>
      actualResults.map((baseline, i) =>
        calculateDelta(
          baseline,
          experimentResults[i],
          experimentPrice > 0 ? experimentPrice : undefined,
        ),
      ),
    [actualResults, experimentResults, experimentPrice],
  );

  return {
    mode,
    setMode,
    experimentBoostIds,
    toggleExperimentBoost,
    resetExperiment,
    experimentActiveBoosts,
    experimentResults,
    deltas,
    clearBoostFromExperiment,
  };
}
