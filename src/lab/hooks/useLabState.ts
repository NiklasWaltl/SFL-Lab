import { useCallback, useMemo, useState } from "react";
import { BOOSTS } from "../config/boosts";
import { RESOURCE_DEFAULTS } from "../config/resources";
import type {
  Boost,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import { calculateResource, getActiveBoosts } from "../utils/calculations";
import { useExperiment } from "./useExperiment";

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

  const actualActiveBoosts = useMemo(
    () => getActiveBoosts(boosts, new Set(), "actual"),
    [boosts],
  );

  const actualResults: ResourceResult[] = useMemo(
    () =>
      resources.map((r) =>
        calculateResource(r, globalParams, actualActiveBoosts),
      ),
    [resources, globalParams, actualActiveBoosts],
  );

  const { clearBoostFromExperiment, ...experiment } = useExperiment(
    boosts,
    resources,
    globalParams,
    actualResults,
  );

  const setBoostOwned = useCallback(
    (id: string, owned: boolean) => {
      setBoosts((prev) => prev.map((b) => (b.id === id ? { ...b, owned } : b)));
      if (owned) clearBoostFromExperiment(id);
    },
    [clearBoostFromExperiment],
  );

  return {
    globalParams,
    resources,
    boosts,
    setGlobalParam,
    setResourceField,
    setBoostOwned,
    actualResults,
    actualActiveBoosts,
    ...experiment,
  };
}

export type LabState = ReturnType<typeof useLabState>;
