import React from "react";
import { SimulatorPicker } from "../components/simulator/SimulatorPicker";
import { SimulatorResult } from "../components/simulator/SimulatorResult";
import { useNftSimulator } from "../hooks/useNftSimulator";
import type {
  Boost,
  ExperimentDelta,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import type { NormalizedFarm } from "../types/player";

export interface NftSimulatorTabProps {
  boosts: Boost[];
  farm: NormalizedFarm | null;
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  deltas: ExperimentDelta[];
  loading: boolean;
  isMock: boolean;
  error: string | null;
  globalParams: GlobalParams;
  resources: ResourceConfig[];
  actualActiveBoosts: Boost[];
}

export function NftSimulatorTab({
  boosts,
  farm,
  actualResults,
  loading,
  isMock,
  error,
  globalParams,
  resources,
  actualActiveBoosts,
}: NftSimulatorTabProps) {
  const {
    boostOptions,
    params,
    setParams,
    selectedAssetKey,
    selectAsset,
    impact,
    selectedBoost,
    simulatorCategories,
  } = useNftSimulator({
    boosts,
    farm,
    actualResults,
    globalParams,
    resources,
    actualActiveBoosts,
  });

  if (loading) {
    return (
      <section className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#3e2731]/40 bg-[#181425] p-8">
        <p className="text-gray-400">{"Farmdaten werden geladen…"}</p>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      <p className="text-sm text-gray-400">
        {
          "Wähle ein NFT oder einen Boost und simuliere seinen Effekt auf deine Farm"
        }
      </p>

      {isMock && (
        <p
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          role="status"
        >
          {"Keine echten Farmdaten – JWT fehlt in URL"}
        </p>
      )}

      {error && (
        <p
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SimulatorPicker
          boosts={boostOptions}
          selectedBoostId={selectedAssetKey ?? null}
          enabled={params.enabled}
          overridePriceFlw={params.overridePriceFlw}
          onSelectBoost={(boostId) => selectAsset(boostId)}
          onToggleEnabled={() => setParams({ enabled: !params.enabled })}
          onChangeOverridePrice={(overridePriceFlw) =>
            setParams({ overridePriceFlw })
          }
        />

        <SimulatorResult
          impact={impact}
          selectedBoost={selectedBoost}
          categoryBreakdown={simulatorCategories}
          enabled={params.enabled}
        />
      </section>
    </article>
  );
}
