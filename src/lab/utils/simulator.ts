import type {
  AnyBoost,
  CategoryKey,
  CategoryValue,
  ResourceResult,
  SimulatorImpact,
} from "../types";
import { isBoostOwned, isNftBoost } from "./boosts";

const EMPTY_IMPACT: SimulatorImpact = {
  totalDelta: 0,
  breakEvenDays: null,
  categoryDeltas: {},
};

/** Boosts für die Simulator-Auswahl (NFTs zuerst, dann nicht-owned, dann Name) */
export function getSimulatorBoostOptions<TBoost extends AnyBoost>(
  boosts: TBoost[],
): TBoost[] {
  return [...boosts].sort((a, b) => {
    const aOwned = isBoostOwned(a);
    const bOwned = isBoostOwned(b);

    if (a.type !== b.type) {
      return a.type === "NFT" ? -1 : 1;
    }
    if (aOwned !== bOwned) {
      return aOwned ? 1 : -1;
    }
    return a.label.localeCompare(b.label, "de");
  });
}

function sumProfit(results: ResourceResult[]): number {
  return results.reduce((sum, r) => sum + r.p2pProfitFlw, 0);
}

function resolvePrice(
  boost: AnyBoost | null,
  overridePriceFlw?: number,
): number | undefined {
  if (overridePriceFlw !== undefined && overridePriceFlw > 0) {
    return overridePriceFlw;
  }
  if (boost && isNftBoost(boost) && boost.priceFlw > 0) {
    return boost.priceFlw;
  }
  return undefined;
}

/** Heuristische Kategorie-Keys, die ein Boost primär beeinflusst */
export function getBoostAffectedCategoryKeys(boost: AnyBoost): {
  keys: CategoryKey[];
  estimated: boolean;
} {
  const keys = new Set<CategoryKey>();

  for (const effect of boost.effects) {
    if (
      effect.resource === "wood" ||
      effect.resource === "stone" ||
      effect.resource === "all"
    ) {
      keys.add("resources");
    }

    if (effect.effectType === "reduceToolCost") {
      keys.add("costs");
    }

    if (
      effect.effectType === "reduceRecovery" ||
      effect.effectType === "addYield"
    ) {
      if (!keys.has("resources")) {
        keys.add("resources");
      }
    }
  }

  if (keys.size === 0) {
    keys.add("resources");
    return { keys: [...keys], estimated: true };
  }

  const estimated =
    boost.effects.length === 0 ||
    boost.effects.some(
      (effect) =>
        effect.resource !== "wood" &&
        effect.resource !== "stone" &&
        effect.resource !== "all",
    );

  return { keys: [...keys], estimated };
}

function buildHeuristicCategoryDeltas(
  boost: AnyBoost,
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
  selectedBoosts: AnyBoost[],
  enabled: boolean,
  actualResults: ResourceResult[],
  experimentResults: ResourceResult[],
  categoryBreakdown: CategoryValue[],
  priceBoost?: AnyBoost | null,
  overridePriceFlw?: number,
): SimulatorImpact {
  if (selectedBoosts.length === 0 || !enabled) {
    return { ...EMPTY_IMPACT, breakEvenDays: null };
  }

  const primaryBoost = selectedBoosts[0];

  const totalDelta = sumProfit(experimentResults) - sumProfit(actualResults);

  const categoryDeltasFromBreakdown: Record<string, number> = {};
  for (const cat of categoryBreakdown) {
    if (cat.status === "placeholder") continue;
    categoryDeltasFromBreakdown[cat.key] = cat.delta;
  }

  const hasBreakdownDeltas =
    Object.keys(categoryDeltasFromBreakdown).length > 0;
  const { deltas: heuristicDeltas, estimatedKeys } =
    buildHeuristicCategoryDeltas(primaryBoost, totalDelta, categoryBreakdown);

  const categoryDeltas = hasBreakdownDeltas
    ? categoryDeltasFromBreakdown
    : heuristicDeltas;

  const price = resolvePrice(
    priceBoost ?? selectedBoosts.find(isNftBoost) ?? null,
    overridePriceFlw,
  );

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

export function getBoostDescription(boost: AnyBoost): string {
  if (boost.effects.length === 0) return "Kein Effekt konfiguriert";

  return boost.effects
    .map((effect) => {
      const resource =
        effect.resource === "all" ? "alle Ressourcen" : effect.resource;
      const pct = `${(effect.value * 100).toFixed(0)} %`;

      switch (effect.effectType) {
        case "addYield":
          return `+${effect.value} Ertrag pro Node (${resource})`;
        case "multiplyYield":
          return `+${pct} Ertrag (${resource})`;
        case "reduceToolCost":
          return `-${pct} Tool-Kosten (${resource})`;
        case "reduceRecovery":
          return `-${pct} Regenerationszeit (${resource})`;
        case "addNodes":
          return `+${effect.value} Nodes (${resource})`;
        default:
          return `Effekt auf ${resource}`;
      }
    })
    .join(" · ");
}
