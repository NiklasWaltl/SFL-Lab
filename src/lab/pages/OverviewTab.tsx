import React, { useEffect, useMemo, useState } from "react";
import { BoostPanel } from "../components/BoostPanel";
import { ConfirmDialog } from "../components/ConfirmDialog";
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
import type { LabMode } from "../hooks/useLabState";
import { useMarketPrices } from "../hooks/useMarketPrices";
import { computeOverviewKpis } from "../utils/overviewKpis";

export interface OverviewTabProps {
  mode: LabMode;
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
  onResetExperiment: () => void;
  actualActiveBoosts: Boost[];
  experimentActiveBoosts: Boost[];
}

export function OverviewTab({
  mode,
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
  onResetExperiment,
  actualActiveBoosts,
  experimentActiveBoosts,
}: OverviewTabProps) {
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const {
    prices: marketPrices,
    loading: pricesLoading,
    error: pricesError,
    isLive: pricesAreLive,
    lastUpdated: pricesLastUpdated,
    refresh: refreshMarketPrices,
  } = useMarketPrices();

  useEffect(() => {
    if (!marketPrices) return;

    const wood = marketPrices.Wood ?? marketPrices.wood;
    const stone = marketPrices.Stone ?? marketPrices.stone;

    if (typeof wood === "number" && wood > 0) {
      setGlobalParam("marketPriceWood", wood);
    }
    if (typeof stone === "number" && stone > 0) {
      setGlobalParam("marketPriceStone", stone);
    }
  }, [marketPrices, setGlobalParam]);

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

  const isExperimentView = mode === "experiment";

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
        mode={mode}
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
          {isExperimentView && woodExperiment && (
            <ResourceCard
              title={`${woodConfig?.label ?? "Wood"} (Experiment)`}
              result={woodExperiment}
              delta={woodDelta}
              mode="experiment"
              showDelta={isExperimentView}
            />
          )}
          {stoneActual && (
            <ResourceCard
              title={`${stoneConfig?.label ?? "Stone"} (Ist)`}
              result={stoneActual}
              mode="actual"
            />
          )}
          {isExperimentView && stoneExperiment && (
            <ResourceCard
              title={`${stoneConfig?.label ?? "Stone"} (Experiment)`}
              result={stoneExperiment}
              delta={stoneDelta}
              mode="experiment"
              showDelta={isExperimentView}
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#ead4aa]">
            {"Simulator"}
          </h2>
          {experimentBoostIds.size > 0 && (
            <button
              type="button"
              onClick={() => setResetConfirmOpen(true)}
              className="rounded-lg border border-[#3e2731]/60 bg-transparent px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-[#3e2731] hover:text-[#ead4aa]"
            >
              {"Experiment zurücksetzen"}
            </button>
          )}
        </div>
        <GlobalParamsPanel
          params={globalParams}
          onChange={setGlobalParam}
          marketPricesState={{
            loading: pricesLoading,
            error: pricesError,
            isLive: pricesAreLive,
            lastUpdated: pricesLastUpdated,
            onRefresh: refreshMarketPrices,
          }}
        />
        {isExperimentView && (
          <BoostPanel
            boosts={boosts}
            experimentBoostIds={experimentBoostIds}
            resources={resources}
            globalParams={globalParams}
            actualActiveBoosts={actualActiveBoosts}
            experimentActiveBoosts={experimentActiveBoosts}
            onToggleExperiment={toggleExperimentBoost}
          />
        )}
      </section>

      {experimentBoostIds.size > 0 && (
        <ConfirmDialog
          isOpen={resetConfirmOpen}
          title={"Experiment zurücksetzen"}
          message={
            "Alle aktiven Boosts werden deaktiviert und der Ansichtsmodus zurückgesetzt."
          }
          confirmLabel={"Zurücksetzen"}
          onConfirm={() => {
            onResetExperiment();
            setResetConfirmOpen(false);
          }}
          onCancel={() => setResetConfirmOpen(false)}
        />
      )}
    </article>
  );
}
