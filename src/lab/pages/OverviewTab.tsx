import React, { useMemo } from "react";
import { BoostPanel } from "../components/BoostPanel";
import { GlobalParamsPanel } from "../components/GlobalParamsPanel";
import { ResourceCard } from "../components/ResourceCard";
import { CategoryPreview } from "../components/overview/CategoryPreview";
import { KpiRow } from "../components/overview/KpiRow";
import type {
  Boost,
  ExperimentDelta,
  GlobalParams,
  NormalizedFarm,
  ResourceConfig,
  ResourceResult,
} from "../types";
import { computeOverviewKpis } from "../utils/overviewKpis";

export interface OverviewTabProps {
  farm: NormalizedFarm | null;
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  deltas: ExperimentDelta[];
  loading: boolean;
  isMock: boolean;
  error: string | null;
  globalParams: GlobalParams;
  setGlobalParam: <K extends keyof GlobalParams>(
    key: K,
    value: GlobalParams[K],
  ) => void;
  resources: ResourceConfig[];
  boosts: Boost[];
  experimentBoostIds: ReadonlySet<string>;
  toggleExperimentBoost: (id: string) => void;
  actualActiveBoosts: Boost[];
  experimentActiveBoosts: Boost[];
}

export function OverviewTab({
  farm,
  actualResults,
  experimentResults,
  deltas,
  loading,
  isMock,
  error,
  globalParams,
  setGlobalParam,
  resources,
  boosts,
  experimentBoostIds,
  toggleExperimentBoost,
  actualActiveBoosts,
  experimentActiveBoosts,
}: OverviewTabProps) {
  const kpis = useMemo(
    () =>
      computeOverviewKpis(
        actualResults,
        experimentResults,
        deltas,
        globalParams,
      ),
    [actualResults, experimentResults, deltas, globalParams],
  );

  const ownedBoostCount = boosts.filter((b) => b.owned).length;
  const experimentBoostCount = experimentBoostIds.size;

  const woodActual = actualResults.find((r) => r.resourceId === "wood");
  const stoneActual = actualResults.find((r) => r.resourceId === "stone");
  const woodExperiment = experimentResults.find((r) => r.resourceId === "wood");
  const stoneExperiment = experimentResults.find(
    (r) => r.resourceId === "stone",
  );
  const woodDelta = deltas.find((d) => d.resourceId === "wood");
  const stoneDelta = deltas.find((d) => d.resourceId === "stone");

  const woodConfig = resources.find((r) => r.id === "wood");
  const stoneConfig = resources.find((r) => r.id === "stone");

  if (loading) {
    return (
      <section className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#3e2731]/40 bg-[#181425] p-8">
        <p className="text-gray-400">{"Farmdaten werden geladen…"}</p>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-6">
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

      <KpiRow
        farm={farm}
        kpis={kpis}
        ownedBoostCount={ownedBoostCount}
        experimentBoostCount={experimentBoostCount}
      />

      <section aria-label="Ist vs. Experiment">
        <h2 className="mb-3 text-lg font-semibold text-[#ead4aa]">
          {"Ist vs. Experiment"}
        </h2>
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {woodActual && (
            <ResourceCard
              title={`${woodConfig?.label ?? "Wood"} (Ist)`}
              result={woodActual}
              mode="actual"
            />
          )}
          {woodExperiment && (
            <ResourceCard
              title={`${woodConfig?.label ?? "Wood"} (Experiment)`}
              result={woodExperiment}
              delta={woodDelta}
              mode="experiment"
            />
          )}
          {stoneActual && (
            <ResourceCard
              title={`${stoneConfig?.label ?? "Stone"} (Ist)`}
              result={stoneActual}
              mode="actual"
            />
          )}
          {stoneExperiment && (
            <ResourceCard
              title={`${stoneConfig?.label ?? "Stone"} (Experiment)`}
              result={stoneExperiment}
              delta={stoneDelta}
              mode="experiment"
            />
          )}
        </section>
      </section>

      <CategoryPreview
        kpis={kpis}
        ownedBoostCount={ownedBoostCount}
        experimentBoostCount={experimentBoostCount}
      />

      <section aria-label="Simulator" className="flex flex-col gap-6">
        <h2 className="text-lg font-semibold text-[#ead4aa]">{"Simulator"}</h2>
        <GlobalParamsPanel params={globalParams} onChange={setGlobalParam} />
        <BoostPanel
          boosts={boosts}
          experimentBoostIds={experimentBoostIds}
          resources={resources}
          globalParams={globalParams}
          actualActiveBoosts={actualActiveBoosts}
          experimentActiveBoosts={experimentActiveBoosts}
          onToggleExperiment={toggleExperimentBoost}
        />
      </section>
    </article>
  );
}
