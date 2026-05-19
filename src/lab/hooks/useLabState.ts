import { useCallback, useMemo, useState } from "react";
import { BOOSTS } from "../config/boosts";
import { RESOURCE_DEFAULTS } from "../config/resources";
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

export type LabMode = "actual" | "experiment";

const DEFAULT_GLOBAL_PARAMS: GlobalParams = {
  coinToFlowerRatio: 1000,
  marketPriceWood: 0.05,
  marketPriceStone: 0.08,
};

function cloneBoosts(boosts: Boost[]): Boost[] {
  return boosts.map((b) => ({ ...b }));
}

function cloneResources(resources: ResourceConfig[]): ResourceConfig[] {
  return resources.map((r) => ({ ...r }));
}

export function useLabState() {
  const [globalParams, setGlobalParamsState] = useState<GlobalParams>(
    DEFAULT_GLOBAL_PARAMS,
  );
  const [resources, setResources] = useState<ResourceConfig[]>(() =>
    cloneResources(RESOURCE_DEFAULTS),
  );
  const [boosts, setBoosts] = useState<Boost[]>(() => cloneBoosts(BOOSTS));
  const [experimentBoostIds, setExperimentBoostIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [mode, setMode] = useState<LabMode>("actual");

  const setGlobalParam = useCallback(
    <K extends keyof GlobalParams>(key: K, value: GlobalParams[K]) => {
      setGlobalParamsState((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const setResourceField = useCallback(
    <K extends keyof ResourceConfig>(
      id: string,
      field: K,
      value: ResourceConfig[K],
    ) => {
      setResources((prev) =>
        prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)),
      );
    },
    [],
  );

  const toggleExperimentBoost = useCallback((id: string) => {
    setBoosts((current) => {
      const boost = current.find((b) => b.id === id);
      if (!boost || boost.owned) return current;

      setExperimentBoostIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      });
      return current;
    });
  }, []);

  const setBoostOwned = useCallback((id: string, owned: boolean) => {
    setBoosts((prev) => prev.map((b) => (b.id === id ? { ...b, owned } : b)));
    if (!owned) return;
    setExperimentBoostIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const actualActiveBoosts = useMemo(
    () => getActiveBoosts(boosts, experimentBoostIds, "actual"),
    [boosts, experimentBoostIds],
  );

  const experimentActiveBoosts = useMemo(
    () => getActiveBoosts(boosts, experimentBoostIds, "experiment"),
    [boosts, experimentBoostIds],
  );

  const actualResults: ResourceResult[] = useMemo(
    () =>
      resources.map((r) =>
        calculateResource(r, globalParams, actualActiveBoosts),
      ),
    [resources, globalParams, actualActiveBoosts],
  );

  const experimentResults: ResourceResult[] = useMemo(
    () =>
      resources.map((r) =>
        calculateResource(r, globalParams, experimentActiveBoosts),
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
    globalParams,
    resources,
    boosts,
    experimentBoostIds,
    mode,
    setMode,
    setGlobalParam,
    setResourceField,
    toggleExperimentBoost,
    setBoostOwned,
    actualResults,
    experimentResults,
    deltas,
    actualActiveBoosts,
    experimentActiveBoosts,
  };
}

export type LabState = ReturnType<typeof useLabState>;
