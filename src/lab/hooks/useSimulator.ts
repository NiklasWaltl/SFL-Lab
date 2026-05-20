import { useCallback, useMemo, useState } from "react";
import { NFT_DEFAULT_PARAMS } from "../config/nft.config";
import type {
  AnyBoost,
  CategoryValue,
  FarmSkillState,
  FarmState,
  NftBoost,
  NftSimulationParams,
  ResourceResult,
  SimulatorImpact,
  SkillBoost,
} from "../types";
import { applyBoosts, calculateResource } from "../utils/calculations";
import { getCategoryBreakdown } from "../utils/categoryBreakdown";
import {
  calculateSimulatorImpact,
  getSimulatorBoostOptions,
} from "../utils/simulator";

export interface UseSimulatorInput {
  nfts: NftBoost[];
  skills: SkillBoost[];
  farmSkillState: FarmSkillState;
  baseState: FarmState;
}

function compactBoosts(boosts: Array<AnyBoost | null>): AnyBoost[] {
  return boosts.filter((boost): boost is AnyBoost => boost !== null);
}

function calculateResults(state: FarmState): ResourceResult[] {
  return state.resources.map((resource) =>
    calculateResource(
      resource,
      state.globalParams,
      [],
      state.globalParams.marketPriceWood,
    ),
  );
}

const EMPTY_IMPACT: SimulatorImpact = {
  totalDelta: 0,
  breakEvenDays: null,
  categoryDeltas: {},
};

export function useSimulator({
  nfts,
  skills,
  farmSkillState,
  baseState,
}: UseSimulatorInput) {
  const [params, setParamsState] = useState<NftSimulationParams>(() => ({
    ...NFT_DEFAULT_PARAMS,
  }));
  const [selectedNftId, setSelectedNftId] = useState<string | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const setParams = useCallback((patch: Partial<NftSimulationParams>) => {
    setParamsState((prev) => ({ ...prev, ...patch }));
  }, []);

  const selectNft = useCallback((id: string | null) => {
    setSelectedNftId(id);
    if (id !== null) {
      setParamsState((prev) => ({ ...prev, enabled: true }));
    }
  }, []);

  const selectSkill = useCallback((id: string | null) => {
    setSelectedSkillId(id);
    if (id !== null) {
      setParamsState((prev) => ({ ...prev, enabled: true }));
    }
  }, []);

  const nftOptions = useMemo(() => getSimulatorBoostOptions(nfts), [nfts]);
  const skillOptions = useMemo(
    () => getSimulatorBoostOptions(skills),
    [skills],
  );

  const selectedNft = useMemo(
    () => nftOptions.find((boost) => boost.id === selectedNftId) ?? null,
    [nftOptions, selectedNftId],
  );
  const selectedSkill = useMemo(
    () => skillOptions.find((boost) => boost.id === selectedSkillId) ?? null,
    [skillOptions, selectedSkillId],
  );

  const ownedBoosts = useMemo(
    () => [...nfts, ...skills].filter((boost) => boost.owned),
    [nfts, skills],
  );

  const actualState = useMemo(
    () => applyBoosts(baseState, ownedBoosts),
    [baseState, ownedBoosts],
  );

  const actualResults = useMemo(
    () => calculateResults(actualState),
    [actualState],
  );

  const selectedBoosts = useMemo(
    () => compactBoosts([selectedNft, selectedSkill]),
    [selectedNft, selectedSkill],
  );

  const activeSelection = useMemo(
    () =>
      params.enabled ? selectedBoosts.filter((boost) => !boost.owned) : [],
    [params.enabled, selectedBoosts],
  );

  const simulationState = useMemo(
    () => applyBoosts(actualState, activeSelection),
    [actualState, activeSelection],
  );
  const simulationResults = useMemo(
    () => calculateResults(simulationState),
    [simulationState],
  );

  const nftOnlyResults = useMemo(() => {
    if (!params.enabled || selectedNft === null || selectedNft.owned) {
      return actualResults;
    }
    return calculateResults(applyBoosts(actualState, [selectedNft]));
  }, [actualState, actualResults, params.enabled, selectedNft]);

  const skillOnlyResults = useMemo(() => {
    if (!params.enabled || selectedSkill === null || selectedSkill.owned) {
      return actualResults;
    }
    return calculateResults(applyBoosts(actualState, [selectedSkill]));
  }, [actualState, actualResults, params.enabled, selectedSkill]);

  const simulatorCategories: CategoryValue[] = useMemo(
    () =>
      getCategoryBreakdown(
        null,
        actualResults,
        simulationResults,
        [],
        baseState.globalParams,
        {},
        baseState.resources,
        [...nfts, ...skills],
        ownedBoosts,
        [...ownedBoosts, ...activeSelection],
      ),
    [
      actualResults,
      simulationResults,
      baseState.globalParams,
      baseState.resources,
      nfts,
      skills,
      ownedBoosts,
      activeSelection,
    ],
  );

  const impact: SimulatorImpact = useMemo(
    () =>
      calculateSimulatorImpact(
        activeSelection,
        params.enabled,
        actualResults,
        simulationResults,
        simulatorCategories,
        selectedNft,
        params.overridePriceFlw,
      ),
    [
      activeSelection,
      params.enabled,
      params.overridePriceFlw,
      actualResults,
      simulationResults,
      simulatorCategories,
      selectedNft,
    ],
  );

  const nftImpact: SimulatorImpact = useMemo(() => {
    if (!selectedNft || !params.enabled) return EMPTY_IMPACT;
    return calculateSimulatorImpact(
      [selectedNft],
      params.enabled,
      actualResults,
      nftOnlyResults,
      [],
      selectedNft,
      params.overridePriceFlw,
    );
  }, [
    actualResults,
    nftOnlyResults,
    params.enabled,
    params.overridePriceFlw,
    selectedNft,
  ]);

  const skillImpact: SimulatorImpact = useMemo(() => {
    if (!selectedSkill || !params.enabled) return EMPTY_IMPACT;
    return calculateSimulatorImpact(
      [selectedSkill],
      params.enabled,
      actualResults,
      skillOnlyResults,
      [],
    );
  }, [actualResults, skillOnlyResults, params.enabled, selectedSkill]);

  return {
    params,
    setParams,
    nftOptions,
    skillOptions,
    selectedNft,
    selectedSkill,
    selectedNftId,
    selectedSkillId,
    selectNft,
    selectSkill,
    impact,
    nftImpact,
    skillImpact,
    simulatorCategories,
    actualResults,
    simulationResults,
    farmSkillState,
  };
}
