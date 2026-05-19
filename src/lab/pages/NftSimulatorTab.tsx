import React, { useMemo, useState } from "react";
import { SimulatorPicker } from "../components/simulator/SimulatorPicker";
import { SimulatorResult } from "../components/simulator/SimulatorResult";
import type {
  Boost,
  ExperimentDelta,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import type { CategoryValue } from "../types/categories";
import type { NormalizedFarm } from "../types/player";
import type { SimulatorSelection } from "../types/simulator";
import { calculateResource } from "../utils/calculations";
import { getCategoryBreakdown } from "../utils/categoryBreakdown";
import {
  calculateSimulatorImpact,
  getSimulatorBoostOptions,
} from "../utils/simulator";

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

const DEFAULT_SELECTION: SimulatorSelection = {
  boostId: null,
  enabled: true,
};

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
  const [selection, setSelection] =
    useState<SimulatorSelection>(DEFAULT_SELECTION);

  const boostOptions = useMemo(
    () => getSimulatorBoostOptions(boosts),
    [boosts],
  );

  const simulatedActiveBoosts = useMemo(() => {
    if (!selection.enabled || !selection.boostId) {
      return actualActiveBoosts;
    }
    const boost = boosts.find((b) => b.id === selection.boostId);
    if (!boost) return actualActiveBoosts;
    if (actualActiveBoosts.some((b) => b.id === boost.id)) {
      return actualActiveBoosts;
    }
    return [...actualActiveBoosts, boost];
  }, [selection.enabled, selection.boostId, boosts, actualActiveBoosts]);

  const simulatedResults: ResourceResult[] = useMemo(
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
        simulatedResults,
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
      simulatedResults,
      globalParams,
      resources,
      boosts,
      actualActiveBoosts,
      simulatedActiveBoosts,
    ],
  );

  const impact = useMemo(
    () =>
      calculateSimulatorImpact(
        selection.boostId,
        selection.enabled,
        boosts,
        actualResults,
        simulatedResults,
        simulatorCategories,
        selection.overridePriceFlw,
      ),
    [
      selection.boostId,
      selection.enabled,
      selection.overridePriceFlw,
      boosts,
      actualResults,
      simulatedResults,
      simulatorCategories,
    ],
  );

  const selectedBoost = boosts.find((b) => b.id === selection.boostId) ?? null;

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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SimulatorPicker
          boosts={boostOptions}
          selectedBoostId={selection.boostId}
          enabled={selection.enabled}
          overridePriceFlw={selection.overridePriceFlw}
          onSelectBoost={(boostId) =>
            setSelection((prev) => ({
              ...prev,
              boostId,
              enabled: true,
            }))
          }
          onToggleEnabled={() =>
            setSelection((prev) => ({ ...prev, enabled: !prev.enabled }))
          }
          onChangeOverridePrice={(overridePriceFlw) =>
            setSelection((prev) => ({ ...prev, overridePriceFlw }))
          }
        />

        <SimulatorResult
          impact={impact}
          selectedBoost={selectedBoost}
          categoryBreakdown={simulatorCategories}
          enabled={selection.enabled}
        />
      </div>
    </article>
  );
}
