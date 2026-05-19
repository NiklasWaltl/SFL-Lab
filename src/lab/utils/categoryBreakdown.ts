import type { NormalizedFarm } from "../types/player";
import type {
  Boost,
  ExperimentDelta,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import type { CategoryKey, CategoryValue } from "../types/categories";
import { CATEGORIES, CATEGORY_BY_KEY } from "../config/categories.config";
import { calculateBoostMarginalProfit } from "./calculations";

const PLACEHOLDER_KEYS: CategoryKey[] = CATEGORIES.filter(
  (category) => category.defaultStatus === "placeholder",
).map((category) => category.key);

function sumProfit(results: ResourceResult[]): number {
  return results.reduce((sum, r) => sum + r.p2pProfitFlw, 0);
}

/** Gleiche Semantik wie overviewKpis.totalCostsPerDay */
function sumCosts(
  results: ResourceResult[],
  globalParams: GlobalParams,
): number {
  return results.reduce((sum, r) => {
    const coinAsFlw = r.coinCostPerDay / globalParams.coinToFlowerRatio;
    return sum + coinAsFlw + r.flwCostPerDay;
  }, 0);
}

function sumBoostMarginal(
  activeBoosts: Boost[],
  resources: ResourceConfig[],
  globalParams: GlobalParams,
): number {
  return activeBoosts.reduce((sum, boost) => {
    const baseForMarginal = activeBoosts.filter((b) => b.id !== boost.id);
    return (
      sum +
      calculateBoostMarginalProfit(
        boost,
        resources,
        globalParams,
        baseForMarginal,
      )
    );
  }, 0);
}

function applyShareOfTotal(categories: CategoryValue[]): CategoryValue[] {
  const net = categories.find((c) => c.key === "net");
  const denominator =
    net && net.actual > 0
      ? net.actual
      : categories
          .filter(
            (c) =>
              c.status !== "placeholder" &&
              c.key !== "costs" &&
              c.key !== "net",
          )
          .reduce((sum, c) => sum + Math.max(0, c.actual), 0);

  if (denominator <= 0) return categories;

  return categories.map((c) => {
    if (c.status === "placeholder" || c.key === "costs" || c.key === "net") {
      return c;
    }
    return {
      ...c,
      shareOfTotal: (c.actual / denominator) * 100,
    };
  });
}

function buildCategory(
  key: CategoryKey,
  actual: number,
  experiment: number,
  status: CategoryValue["status"],
  description?: string,
): CategoryValue {
  const meta = CATEGORY_BY_KEY[key];
  return {
    key,
    label: meta.label,
    actual,
    experiment,
    delta: experiment - actual,
    description: description ?? meta.description,
    status,
  };
}

export function getCategoryBreakdown(
  _farm: NormalizedFarm | null,
  actualResults: ResourceResult[],
  experimentResults: ResourceResult[],
  _deltas: ExperimentDelta[],
  globalParams: GlobalParams,
  resources: ResourceConfig[],
  _boosts: Boost[],
  actualActiveBoosts: Boost[],
  experimentActiveBoosts: Boost[],
): CategoryValue[] {
  const resourcesActual = sumProfit(actualResults);
  const resourcesExperiment = sumProfit(experimentResults);

  const costsActual = sumCosts(actualResults, globalParams);
  const costsExperiment = sumCosts(experimentResults, globalParams);

  const boostsActual = sumBoostMarginal(
    actualActiveBoosts,
    resources,
    globalParams,
  );
  const boostsExperiment = sumBoostMarginal(
    experimentActiveBoosts,
    resources,
    globalParams,
  );

  const netActual = sumProfit(actualResults);
  const netExperiment = sumProfit(experimentResults);

  const categories: CategoryValue[] = [
    buildCategory(
      "resources",
      resourcesActual,
      resourcesExperiment,
      "calculated",
    ),
    ...PLACEHOLDER_KEYS.map((key) => buildCategory(key, 0, 0, "placeholder")),
    buildCategory("boosts", boostsActual, boostsExperiment, "partial"),
    buildCategory("costs", costsActual, costsExperiment, "calculated"),
    buildCategory("net", netActual, netExperiment, "calculated"),
  ];

  return applyShareOfTotal(categories);
}

// ---------------------------------------------------------------------------
// Detail lines for CategoryDetails
// ---------------------------------------------------------------------------

export interface ResourceDetailLine {
  resourceId: string;
  label: string;
  actual: number;
  experiment: number;
  delta: number;
}

export function getResourceDetailLines(
  actualResults: ResourceResult[],
  experimentResults: ResourceResult[],
  resources: ResourceConfig[],
): ResourceDetailLine[] {
  const ids = ["wood", "stone"];
  return ids.map((id) => {
    const config = resources.find((r) => r.id === id);
    const actual = actualResults.find((r) => r.resourceId === id);
    const experiment = experimentResults.find((r) => r.resourceId === id);
    const actualProfit = actual?.p2pProfitFlw ?? 0;
    const experimentProfit = experiment?.p2pProfitFlw ?? 0;
    return {
      resourceId: id,
      label: config?.label ?? id,
      actual: actualProfit,
      experiment: experimentProfit,
      delta: experimentProfit - actualProfit,
    };
  });
}

export interface CostDetailLine {
  resourceId: string;
  label: string;
  coinCostFlw: number;
  flwCostPerDay: number;
  woodCostPerDay?: number;
  total: number;
}

export function getCostDetailLines(
  results: ResourceResult[],
  globalParams: GlobalParams,
  resources: ResourceConfig[],
): CostDetailLine[] {
  return results.map((r) => {
    const config = resources.find((c) => c.id === r.resourceId);
    const coinCostFlw = r.coinCostPerDay / globalParams.coinToFlowerRatio;
    const total = coinCostFlw + r.flwCostPerDay;
    return {
      resourceId: r.resourceId,
      label: config?.label ?? r.resourceId,
      coinCostFlw,
      flwCostPerDay: r.flwCostPerDay,
      woodCostPerDay: r.woodCostPerDay,
      total,
    };
  });
}

export interface BoostDetailLine {
  boost: Boost;
  marginalActual: number | null;
  marginalExperiment: number | null;
  isExperimentOnly: boolean;
}

export function getBoostDetailLines(
  resources: ResourceConfig[],
  globalParams: GlobalParams,
  actualActiveBoosts: Boost[],
  experimentActiveBoosts: Boost[],
): BoostDetailLine[] {
  const allBoostIds = new Set([
    ...actualActiveBoosts.map((b) => b.id),
    ...experimentActiveBoosts.map((b) => b.id),
  ]);

  const boostById = new Map(
    [...actualActiveBoosts, ...experimentActiveBoosts].map((b) => [b.id, b]),
  );

  return [...allBoostIds].map((id) => {
    const boost = boostById.get(id)!;
    const inActual = actualActiveBoosts.some((b) => b.id === id);
    const inExperiment = experimentActiveBoosts.some((b) => b.id === id);

    const marginalActual = inActual
      ? calculateBoostMarginalProfit(
          boost,
          resources,
          globalParams,
          actualActiveBoosts.filter((b) => b.id !== id),
        )
      : null;

    const marginalExperiment = inExperiment
      ? calculateBoostMarginalProfit(
          boost,
          resources,
          globalParams,
          experimentActiveBoosts.filter((b) => b.id !== id),
        )
      : null;

    return {
      boost,
      marginalActual,
      marginalExperiment,
      isExperimentOnly: !inActual && inExperiment,
    };
  });
}

export interface NetDetailLine {
  key: CategoryKey;
  label: string;
  actual: number;
  experiment: number;
  status: CategoryValue["status"];
}

export function getNetDetailLines(
  categories: CategoryValue[],
): NetDetailLine[] {
  return categories
    .filter((c) => c.key !== "net")
    .map((c) => ({
      key: c.key,
      label: c.label,
      actual: c.actual,
      experiment: c.experiment,
      status: c.status,
    }));
}
