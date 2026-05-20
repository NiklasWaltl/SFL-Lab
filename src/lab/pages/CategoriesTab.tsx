import React, { useMemo, useState } from "react";
import { CategoryCard } from "../components/categories/CategoryCard";
import { CategoryDetails } from "../components/categories/CategoryDetails";
import { CATEGORIES } from "../config/categories.config";
import type { LabMode } from "../hooks/useLabState";
import type {
  Boost,
  CategoryDetailContext,
  CategoryKey,
  ExperimentDelta,
  GlobalParams,
  NormalizedFarm,
  ResourceConfig,
  ResourceResult,
} from "../types";
import { getCategoryBreakdown } from "../utils/categoryBreakdown";
import { getCategorySummary } from "../utils/categorySummary";
import { deltaColorClass, formatDelta, formatNumber } from "../utils/format";

export interface CategoriesTabProps {
  mode: LabMode;
  farm: NormalizedFarm | null;
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  deltas: ExperimentDelta[];
  loading: boolean;
  isMock: boolean;
  error: string | null;
  globalParams: GlobalParams;
  resources: ResourceConfig[];
  boosts: Boost[];
  actualActiveBoosts: Boost[];
  experimentActiveBoosts: Boost[];
}

export function CategoriesTab({
  mode,
  farm,
  actualResults,
  experimentResults,
  deltas,
  loading,
  isMock,
  error,
  globalParams,
  resources,
  boosts,
  actualActiveBoosts,
  experimentActiveBoosts,
}: CategoriesTabProps) {
  const [expandedKey, setExpandedKey] = useState<CategoryKey | null>(null);
  const isExperimentView = mode === "experiment";

  const categories = useMemo(
    () =>
      getCategoryBreakdown(
        farm,
        actualResults,
        experimentResults,
        deltas,
        globalParams,
        resources,
        boosts,
        actualActiveBoosts,
        experimentActiveBoosts,
      ),
    [
      farm,
      actualResults,
      experimentResults,
      deltas,
      globalParams,
      resources,
      boosts,
      actualActiveBoosts,
      experimentActiveBoosts,
    ],
  );

  const summary = useMemo(() => getCategorySummary(categories), [categories]);

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
      globalParams,
      resources,
      boosts,
      actualActiveBoosts,
      experimentActiveBoosts,
    }),
    [
      globalParams,
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
                    actualResults={actualResults}
                    experimentResults={experimentResults}
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
