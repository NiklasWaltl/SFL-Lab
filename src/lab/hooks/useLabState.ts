import { useCallback, useMemo, useState } from "react";
import { BOOSTS } from "../config/boosts";
import { RESOURCE_DEFAULTS } from "../config/resources";
import type {
  Boost,
  GlobalParams,
  PlayerData,
  ResourceConfig,
  ResourceResult,
} from "../types";
import { calculateResource, getActiveBoosts } from "../utils/calculations";
import { applyApiBoosts, isNftBoost, isSkillBoost } from "../utils/boosts";
import { useExperiment } from "./useExperiment";

export type LabMode = "actual" | "experiment";

const DEFAULT_GLOBAL_PARAMS: GlobalParams = {
  coinToFlowerRatio: 320, // Referenz: 5120 Coins/Tag ÷ 16 FLW/Tag (Wood)
  marketPriceWood: 0.018, // P2P-Referenz aus Game
  marketPriceStone: 0.0265, // P2P-Referenz aus Game
  cropPrices: {},
};

function cloneBoosts(boosts: Boost[]): Boost[] {
  return boosts.map((b) => ({
    ...b,
    effects: b.effects.map((effect) => ({ ...effect })),
  }));
}

function cloneResources(resources: ResourceConfig[]): ResourceConfig[] {
  return resources.map((r) => ({ ...r }));
}

function applyPlayerNodeCounts(
  resources: ResourceConfig[],
  playerData?: PlayerData | null,
): ResourceConfig[] {
  const trees = playerData?.resources?.trees;
  const stones = playerData?.resources?.stones;

  return resources.map((resource) => {
    if (resource.id === "wood" && typeof trees === "number" && trees > 0) {
      return { ...resource, nodeCount: trees };
    }

    if (resource.id === "stone" && typeof stones === "number" && stones > 0) {
      return { ...resource, nodeCount: stones };
    }

    return resource;
  });
}

export function useLabState(playerData?: PlayerData | null) {
  const [globalParams, setGlobalParamsState] = useState<GlobalParams>(
    DEFAULT_GLOBAL_PARAMS,
  );
  const [resources, setResources] = useState<ResourceConfig[]>(() =>
    cloneResources(RESOURCE_DEFAULTS),
  );
  const [boosts, setBoosts] = useState<Boost[]>(() => cloneBoosts(BOOSTS));
  const enrichedBoosts = useMemo(
    () => applyApiBoosts(boosts, playerData ?? null),
    [boosts, playerData],
  );
  const nfts = useMemo(
    () => enrichedBoosts.filter(isNftBoost),
    [enrichedBoosts],
  );
  const skills = useMemo(
    () => enrichedBoosts.filter(isSkillBoost),
    [enrichedBoosts],
  );

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

  const effectiveResources = useMemo(
    () => applyPlayerNodeCounts(resources, playerData),
    [resources, playerData],
  );

  const actualActiveBoosts = useMemo(
    () => getActiveBoosts(enrichedBoosts, new Set(), "actual"),
    [enrichedBoosts],
  );

  const actualResults: ResourceResult[] = useMemo(
    () =>
      effectiveResources.map((r) =>
        calculateResource(
          r,
          globalParams,
          actualActiveBoosts,
          globalParams.marketPriceWood,
        ),
      ),
    [effectiveResources, globalParams, actualActiveBoosts],
  );

  const { clearBoostFromExperiment, ...experiment } = useExperiment(
    enrichedBoosts,
    effectiveResources,
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
    resources: effectiveResources,
    boosts: enrichedBoosts,
    nfts,
    skills,
    setGlobalParam,
    setResourceField,
    setBoostOwned,
    actualResults,
    actualActiveBoosts,
    ...experiment,
  };
}

export type LabState = ReturnType<typeof useLabState>;
