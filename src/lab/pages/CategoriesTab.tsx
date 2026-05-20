import React, { useMemo, useState } from "react";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CategoryDetails } from "../components/categories/CategoryDetails";
import { CATEGORIES } from "../config/categories.config";
import type { LabMode } from "../hooks/useLabState";
import { useMarketPrices } from "../hooks/useMarketPrices";
import type {
  Boost,
  CategoryDetailContext,
  CategoryKey,
  ExperimentDelta,
  GlobalParams,
  NormalizedFarm,
  PlayerData,
  ResourceConfig,
  ResourceResult,
} from "../types";
import { getCategoryBreakdown } from "../utils/categoryBreakdown";
import { getCategorySummary } from "../utils/categorySummary";
import { getFarmConnectionStatusMessage } from "../utils/farmConnectionStatus";
import { deltaColorClass, formatDelta, formatNumber } from "../utils/format";

export interface CategoriesTabProps {
  farmId: number | null;
  apiKey: string | null;
  mode: LabMode;
  farm: NormalizedFarm | null;
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  deltas: ExperimentDelta[];
  playerData: PlayerData | null;
  loading: boolean;
  isMock: boolean;
  error: string | null;
  connectionAttempted: boolean;
  globalParams: GlobalParams;
  resources: ResourceConfig[];
  boosts: Boost[];
  actualActiveBoosts: Boost[];
  experimentActiveBoosts: Boost[];
}

export function CategoriesTab({
  farmId,
  apiKey,
  mode,
  farm,
  actualResults,
  experimentResults,
  deltas,
  playerData,
  loading,
  isMock,
  error,
  connectionAttempted,
  globalParams,
  resources,
  boosts,
  actualActiveBoosts,
  experimentActiveBoosts,
}: CategoriesTabProps) {
  const [expandedKey, setExpandedKey] = useState<CategoryKey | null>(null);
  const { prices: marketPrices } = useMarketPrices();
  const categoryMarketPrices = useMemo(
    () => marketPrices ?? {},
    [marketPrices],
  );
  const isExperimentView = mode === "experiment";
  const connectionStatusMessage = getFarmConnectionStatusMessage({
    farmId,
    apiKey,
    isMock,
    error,
    connectionAttempted,
  });

  const categories = useMemo(
    () =>
      getCategoryBreakdown(
        isMock ? null : farm,
        isMock ? [] : actualResults,
        isMock ? [] : experimentResults,
        isMock ? [] : deltas,
        globalParams,
        categoryMarketPrices,
        resources,
        boosts,
        isMock ? [] : actualActiveBoosts,
        isMock ? [] : experimentActiveBoosts,
      ),
    [
      farm,
      isMock,
      actualResults,
      experimentResults,
      deltas,
      globalParams,
      categoryMarketPrices,
      resources,
      boosts,
      actualActiveBoosts,
      experimentActiveBoosts,
    ],
  );

  const summary = useMemo(() => getCategorySummary(categories), [categories]);

  const resourceTiles = useMemo(() => {
    const resourceCounts = playerData?.resources;
    if (isMock || !resourceCounts) return [];

    return [
      { key: "trees", label: "🌲 Trees", value: resourceCounts.trees },
      { key: "stones", label: "🪨 Stones", value: resourceCounts.stones },
      { key: "iron", label: "⛏️ Iron", value: resourceCounts.iron },
      { key: "gold", label: "🥇 Gold", value: resourceCounts.gold },
      { key: "crops", label: "🌾 Crops", value: resourceCounts.crops },
      {
        key: "fruitPatches",
        label: "🍓 Fruit Patches",
        value: resourceCounts.fruitPatches,
      },
      { key: "chickens", label: "🐔 Chickens", value: resourceCounts.chickens },
    ].filter(
      (tile): tile is { key: string; label: string; value: number } =>
        tile.value !== undefined && tile.value > 0,
    );
  }, [isMock, playerData?.resources]);

  const orderedCategories = useMemo(() => {
    const order = new Map(
      CATEGORIES.map((category, index) => [category.key, index]),
    );
    return [...categories].sort(
      (a, b) => (order.get(a.key) ?? 0) - (order.get(b.key) ?? 0),
    );
  }, [categories]);

  const detailContext: CategoryDetailContext = useMemo(
    () => ({
      farm: isMock ? null : farm,
      globalParams,
      marketPrices: categoryMarketPrices,
      resources,
      boosts,
      actualActiveBoosts,
      experimentActiveBoosts,
    }),
    [
      farm,
      isMock,
      globalParams,
      categoryMarketPrices,
      resources,
      boosts,
      actualActiveBoosts,
      experimentActiveBoosts,
    ],
  );

  if (loading) {
    return (
      <section className="flex min-h-[200px] items-center justify-center rounded-xl border border-[#3e2731]/40 bg-[#181425] p-8">
        <p className="text-gray-400">{"Farmdaten werden geladen…"}</p>
      </section>
    );
  }

  return (
    <article className="flex flex-col gap-6">
      {connectionStatusMessage?.variant === "warning" && (
        <p
          className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-200"
          role="status"
        >
          {connectionStatusMessage.text}
        </p>
      )}

      {connectionStatusMessage?.variant === "error" && (
        <p
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300"
          role="alert"
        >
          {connectionStatusMessage.text}
        </p>
      )}

      {!isMock && playerData && (
        <section
          aria-label="Kategorien-Zusammenfassung"
          className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
        >
          <h2 className="mb-3 text-lg font-semibold text-[#ead4aa]">
            {"Einordnung"}
          </h2>
          <div
            className={`grid gap-3 ${
              isExperimentView ? "sm:grid-cols-3" : "sm:grid-cols-2"
            }`}
          >
            <SummaryItem
              label="Stärkste Kategorie"
              value={
                summary.strongest
                  ? `${summary.strongest.label} (${formatNumber(summary.strongest.actual)} FLW/Tag)`
                  : "—"
              }
            />
            <SummaryItem
              label="Schwächste Kategorie"
              value={
                summary.weakest
                  ? `${summary.weakest.label} (${formatNumber(summary.weakest.actual)} FLW/Tag)`
                  : "—"
              }
            />
            {isExperimentView && (
              <SummaryItem
                label="Gesamt-Delta (Netto)"
                value={formatDelta(summary.totalDelta)}
                valueClassName={deltaColorClass(summary.totalDelta)}
              />
            )}
          </div>
        </section>
      )}

      {resourceTiles.length > 0 && (
        <section
          aria-label="Ressourcen-Knoten"
          className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
        >
          <h2 className="mb-3 text-lg font-semibold text-[#ead4aa]">
            {"Ressourcen"}
          </h2>
          <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {resourceTiles.map((tile) => (
              <li
                key={tile.key}
                className="rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a]/60 p-3 text-sm font-semibold text-[#ead4aa]"
              >
                {`${tile.label}: ${tile.value}`}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-label="Gewinnbereiche">
        <h2 className="mb-3 text-lg font-semibold text-[#ead4aa]">
          {"Gewinnbereiche"}
        </h2>
        <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {orderedCategories.map((category) => {
            const isExpanded = expandedKey === category.key;
            return (
              <li key={category.key} className="flex flex-col">
                <CategoryCard
                  category={category}
                  isExperimentView={isExperimentView}
                  expanded={isExpanded}
                  onToggleExpand={() =>
                    setExpandedKey(isExpanded ? null : category.key)
                  }
                />
                {isExpanded && (
                  <CategoryDetails
                    category={category}
                    detailContext={detailContext}
                    actualResults={isMock ? [] : actualResults}
                    experimentResults={isMock ? [] : experimentResults}
                    allCategories={orderedCategories}
                    isExperimentView={isExperimentView}
                  />
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </article>
  );
}

function SummaryItem({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </p>
      <p
        className={`mt-1 text-sm font-semibold text-[#ead4aa] ${valueClassName ?? ""}`}
      >
        {value}
      </p>
    </div>
  );
}
