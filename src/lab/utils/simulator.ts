import type {
  Boost,
  CategoryKey,
  CategoryValue,
  ResourceResult,
  SimulatorImpact,
} from "../types";

const EMPTY_IMPACT: SimulatorImpact = {
  totalDelta: 0,
  breakEvenDays: null,
  categoryDeltas: {},
};

/** Boosts für die Simulator-Auswahl (NFTs zuerst, dann nicht-owned, dann Name) */
export function getSimulatorBoostOptions(boosts: Boost[]): Boost[] {
  return [...boosts].sort((a, b) => {
    if (a.source !== b.source) {
      return a.source === "nft" ? -1 : 1;
    }
    if (a.owned !== b.owned) {
      return a.owned ? 1 : -1;
    }
    return a.label.localeCompare(b.label, "de");
  });
}

function sumProfit(results: ResourceResult[]): number {
  return results.reduce((sum, r) => sum + r.p2pProfitFlw, 0);
}

function resolvePrice(
  boost: Boost | null,
  overridePriceFlw?: number,
): number | undefined {
  if (overridePriceFlw !== undefined && overridePriceFlw > 0) {
    return overridePriceFlw;
  }
  if (boost?.priceFlw !== undefined && boost.priceFlw > 0) {
    return boost.priceFlw;
  }
  return undefined;
}

/** Heuristische Kategorie-Keys, die ein Boost primär beeinflusst */
export function getBoostAffectedCategoryKeys(boost: Boost): {
  keys: CategoryKey[];
  estimated: boolean;
} {
  const keys = new Set<CategoryKey>();

  if (
    boost.affectsResource === "wood" ||
    boost.affectsResource === "stone" ||
    boost.affectsResource === "all"
  ) {
    keys.add("resources");
  }

  if (boost.type === "reduceToolCost") {
    keys.add("costs");
  }

  if (boost.type === "reduceRecovery" || boost.type === "addYield") {
    if (!keys.has("resources")) {
      keys.add("resources");
    }
  }

  if (keys.size === 0) {
    keys.add("resources");
    return { keys: [...keys], estimated: true };
  }

  const estimated =
    boost.affectsResource !== "wood" &&
    boost.affectsResource !== "stone" &&
    boost.affectsResource !== "all";

  return { keys: [...keys], estimated };
}

function buildHeuristicCategoryDeltas(
  boost: Boost,
  totalDelta: number,
  categoryBreakdown: CategoryValue[],
): { deltas: Record<string, number>; estimatedKeys: CategoryKey[] } {
  const { keys, estimated } = getBoostAffectedCategoryKeys(boost);
  const deltas: Record<string, number> = {};
  const estimatedKeys: CategoryKey[] = estimated ? [...keys] : [];

  const netDelta =
    categoryBreakdown.find((c) => c.key === "net")?.delta ?? totalDelta;

  for (const key of keys) {
    const fromBreakdown = categoryBreakdown.find((c) => c.key === key);
    if (fromBreakdown && fromBreakdown.status !== "placeholder") {
      deltas[key] = fromBreakdown.delta;
    } else if (key === "resources") {
      deltas[key] = totalDelta;
      if (estimated) estimatedKeys.push(key);
    } else if (key === "costs") {
      deltas[key] = 0;
    }
  }

  deltas.net = netDelta;

  return { deltas, estimatedKeys: [...new Set(estimatedKeys)] };
}

export function calculateSimulatorImpact(
  selectedBoostId: string | null,
  enabled: boolean,
  boosts: Boost[],
  actualResults: ResourceResult[],
  experimentResults: ResourceResult[],
  categoryBreakdown: CategoryValue[],
  overridePriceFlw?: number,
): SimulatorImpact {
  if (!selectedBoostId || !enabled) {
    return { ...EMPTY_IMPACT, breakEvenDays: null };
  }

  const boost = boosts.find((b) => b.id === selectedBoostId);
  if (!boost) {
    return { ...EMPTY_IMPACT, breakEvenDays: null };
  }

  const totalDelta = sumProfit(experimentResults) - sumProfit(actualResults);

  const categoryDeltasFromBreakdown: Record<string, number> = {};
  for (const cat of categoryBreakdown) {
    if (cat.status === "placeholder") continue;
    categoryDeltasFromBreakdown[cat.key] = cat.delta;
  }

  const hasBreakdownDeltas =
    Object.keys(categoryDeltasFromBreakdown).length > 0;
  const { deltas: heuristicDeltas, estimatedKeys } =
    buildHeuristicCategoryDeltas(boost, totalDelta, categoryBreakdown);

  const categoryDeltas = hasBreakdownDeltas
    ? categoryDeltasFromBreakdown
    : heuristicDeltas;

  const price = resolvePrice(boost, overridePriceFlw);

  let breakEvenDays: number | null = null;
  let roiPercent: number | undefined;

  if (price !== undefined && totalDelta > 0) {
    breakEvenDays = Math.ceil(price / totalDelta);
    roiPercent = ((totalDelta * 365) / price) * 100;
  } else if (price !== undefined && totalDelta <= 0) {
    breakEvenDays = null;
    roiPercent = totalDelta < 0 ? undefined : 0;
  }

  return {
    totalDelta,
    breakEvenDays,
    roiPercent,
    categoryDeltas,
    estimatedCategoryKeys: estimatedKeys.length > 0 ? estimatedKeys : undefined,
  };
}

export function getBoostDescription(boost: Boost): string {
  const resource =
    boost.affectsResource === "all" ? "alle Ressourcen" : boost.affectsResource;
  const pct = `${(boost.value * 100).toFixed(0)} %`;

  switch (boost.type) {
    case "addYield":
      return `+${boost.value} Ertrag pro Node (${resource})`;
    case "multiplyYield":
      return `+${pct} Ertrag (${resource})`;
    case "reduceToolCost":
      return `-${pct} Tool-Kosten (${resource})`;
    case "reduceRecovery":
      return `-${pct} Regenerationszeit (${resource})`;
    case "addNodes":
      return `+${boost.value} Nodes (${resource})`;
    default:
      return `Effekt auf ${resource}`;
  }
}
