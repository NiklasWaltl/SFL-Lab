import React, { useState } from "react";
import { SimulatorPicker } from "../components/simulator/SimulatorPicker";
import { SimulatorResult } from "../components/simulator/SimulatorResult";
import { useSimulator } from "../hooks/useSimulator";
import { getTotalSkillPoints } from "../utils/boosts";
import type { FarmSkillState, FarmState, NftBoost, SkillBoost } from "../types";

const MAX_SIMULATED_FARM_LEVEL = 20;

export interface SimulatorTabProps {
  nfts: NftBoost[];
  skills: SkillBoost[];
  farmSkillState: FarmSkillState;
  baseState: FarmState;
}

export function SimulatorTab({
  nfts,
  skills,
  farmSkillState,
  baseState,
}: SimulatorTabProps) {
  const [simulatedFarmLevel, setSimulatedFarmLevel] = useState(
    () => farmSkillState.farmLevel,
  );
  const effectiveFarmLevel = Math.max(
    simulatedFarmLevel,
    farmSkillState.farmLevel,
  );
  const {
    nftOptions,
    skillOptions,
    params,
    setParams,
    selectedNftId,
    selectedSkillId,
    selectNft,
    selectSkill,
    impact,
    nftImpact,
    skillImpact,
    selectedNft,
    selectedSkill,
    simulatorCategories,
  } = useSimulator({
    nfts,
    skills,
    farmSkillState,
    baseState,
  });
  const simSkillPointsTotal = getTotalSkillPoints(effectiveFarmLevel);
  const simSkillPointsSpent = selectedSkill ? selectedSkill.skillPointCost : 0;
  const simSkillPointsAvailable =
    simSkillPointsTotal - farmSkillState.skillPointsSpent - simSkillPointsSpent;
  const canSimulateSkill = (skill: SkillBoost): boolean =>
    skill.owned ||
    simSkillPointsTotal - farmSkillState.skillPointsSpent >=
      skill.skillPointCost;

  const updateSimulatedFarmLevel = (nextLevel: number) => {
    const next = Math.min(
      MAX_SIMULATED_FARM_LEVEL,
      Math.max(farmSkillState.farmLevel, Math.floor(nextLevel)),
    );
    setSimulatedFarmLevel(next);

    if (
      selectedSkill &&
      getTotalSkillPoints(next) - farmSkillState.skillPointsSpent <
        selectedSkill.skillPointCost
    ) {
      selectSkill(null);
    }
  };

  return (
    <article className="flex flex-col gap-6">
      <p className="text-sm text-gray-400">
        {
          "Wähle NFTs und Skills und simuliere ihren gemeinsamen Effekt auf deine Farm."
        }
      </p>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SimulatorPicker
          nfts={nftOptions}
          skills={skillOptions}
          farmSkillState={farmSkillState}
          simulatedFarmLevel={simulatedFarmLevel}
          effectiveFarmLevel={effectiveFarmLevel}
          maxSimulatedFarmLevel={MAX_SIMULATED_FARM_LEVEL}
          simSkillPointsTotal={simSkillPointsTotal}
          simSkillPointsAvailable={simSkillPointsAvailable}
          selectedNftId={selectedNftId}
          selectedSkillId={selectedSkillId}
          enabled={params.enabled}
          overridePriceFlw={params.overridePriceFlw}
          canSimulateSkill={canSimulateSkill}
          onChangeSimulatedFarmLevel={updateSimulatedFarmLevel}
          onSelectNft={(boostId) =>
            selectNft(boostId === selectedNftId ? null : boostId)
          }
          onSelectSkill={(boostId) =>
            selectSkill(boostId === selectedSkillId ? null : boostId)
          }
          onToggleEnabled={() => setParams({ enabled: !params.enabled })}
          onChangeOverridePrice={(overridePriceFlw) =>
            setParams({ overridePriceFlw })
          }
        />

        <SimulatorResult
          impact={impact}
          nftImpact={nftImpact}
          skillImpact={skillImpact}
          selectedNft={selectedNft}
          selectedSkill={selectedSkill}
          farmSkillState={farmSkillState}
          effectiveFarmLevel={effectiveFarmLevel}
          categoryBreakdown={simulatorCategories}
          enabled={params.enabled}
        />
      </section>
    </article>
  );
}
