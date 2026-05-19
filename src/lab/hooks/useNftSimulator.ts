import { useCallback, useMemo, useState } from "react";
import { boostToNftAsset, NFT_DEFAULT_PARAMS } from "../config/nft.config";
import type {
  Boost,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import type { CategoryValue } from "../types/categories";
import type {
  NftAsset,
  NftSimulationParams,
  NftSimulationResult,
} from "../types/nft";
import type { NormalizedFarm } from "../types/player";
import type { SimulatorImpact } from "../types/simulator";
import { calculateResource } from "../utils/calculations";
import { getCategoryBreakdown } from "../utils/categoryBreakdown";
import {
  calculateSimulatorImpact,
  getSimulatorBoostOptions,
} from "../utils/simulator";

export interface UseNftSimulatorInput {
  boosts: Boost[];
  farm: NormalizedFarm | null;
  actualResults: ResourceResult[];
  globalParams: GlobalParams;
  resources: ResourceConfig[];
  actualActiveBoosts: Boost[];
}

export function useNftSimulator({
  boosts,
  farm,
  actualResults,
  globalParams,
  resources,
  actualActiveBoosts,
}: UseNftSimulatorInput) {
  const [params, setParamsState] = useState<NftSimulationParams>(() => ({
    ...NFT_DEFAULT_PARAMS,
  }));
  const [selectedAssetKey, setSelectedAssetKey] = useState<
    string | undefined
  >();

  const setParams = useCallback((patch: Partial<NftSimulationParams>) => {
    setParamsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const resetParams = useCallback(() => {
    setParamsState({ ...NFT_DEFAULT_PARAMS });
    setSelectedAssetKey(undefined);
  }, []);

  const selectAsset = useCallback((key: string | undefined) => {
    setSelectedAssetKey(key);
    if (key !== undefined) {
      setParamsState((prev) => ({ ...prev, enabled: true }));
    }
  }, []);

  const boostOptions = useMemo(
    () => getSimulatorBoostOptions(boosts),
    [boosts],
  );

  const assets: NftAsset[] = useMemo(
    () => boostOptions.map(boostToNftAsset),
    [boostOptions],
  );

  const simulatedActiveBoosts = useMemo(() => {
    if (!params.enabled || !selectedAssetKey) {
      return actualActiveBoosts;
    }
    const boost = boosts.find((b) => b.id === selectedAssetKey);
    if (!boost) return actualActiveBoosts;
    if (actualActiveBoosts.some((b) => b.id === boost.id)) {
      return actualActiveBoosts;
    }
    return [...actualActiveBoosts, boost];
  }, [params.enabled, selectedAssetKey, boosts, actualActiveBoosts]);

  const simulationResults: NftSimulationResult[] = useMemo(
    () =>
      resources.map((r) =>
        calculateResource(r, globalParams, simulatedActiveBoosts),
      ),
    [resources, globalParams, simulatedActiveBoosts],
  );

  const simulatorCategories: CategoryValue[] = useMemo(
    () =>
      getCategoryBreakdown(
        farm,
        actualResults,
        simulationResults,
        [],
        globalParams,
        resources,
        boosts,
        actualActiveBoosts,
        simulatedActiveBoosts,
      ),
    [
      farm,
      actualResults,
      simulationResults,
      globalParams,
      resources,
      boosts,
      actualActiveBoosts,
      simulatedActiveBoosts,
    ],
  );

  const impact: SimulatorImpact = useMemo(
    () =>
      calculateSimulatorImpact(
        selectedAssetKey ?? null,
        params.enabled,
        boosts,
        actualResults,
        simulationResults,
        simulatorCategories,
        params.overridePriceFlw,
      ),
    [
      selectedAssetKey,
      params.enabled,
      params.overridePriceFlw,
      boosts,
      actualResults,
      simulationResults,
      simulatorCategories,
    ],
  );

  const currentResult = impact;

  const marginalValues = useMemo(
    () => impact.categoryDeltas,
    [impact.categoryDeltas],
  );

  const totalValue = impact.totalDelta;

  const marginalPrices = useMemo(() => {
    const prices: Record<string, number> = {};
    for (const asset of assets) {
      if (asset.basePrice !== undefined && asset.basePrice > 0) {
        prices[asset.key] = asset.basePrice;
      }
    }
    if (
      selectedAssetKey &&
      params.overridePriceFlw !== undefined &&
      params.overridePriceFlw > 0
    ) {
      prices[selectedAssetKey] = params.overridePriceFlw;
    }
    return prices;
  }, [assets, selectedAssetKey, params.overridePriceFlw]);

  const selectedBoost = boosts.find((b) => b.id === selectedAssetKey) ?? null;

  return {
    assets,
    boostOptions,
    params,
    setParams,
    resetParams,
    selectedAssetKey,
    selectAsset,
    simulationResults,
    currentResult,
    impact,
    marginalValues,
    totalValue,
    marginalPrices,
    simulatorCategories,
    selectedBoost,
    simulatedActiveBoosts,
  };
}
