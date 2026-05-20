// SFL-Lab – Berechnungslogik (pure functions, kein UI)
// Alle Formeln zentral hier – Komponenten nur für Darstellung

import type {
  ResourceConfig,
  GlobalParams,
  Boost,
  ResourceResult,
  ExperimentDelta,
} from "../types";

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

/** Zyklen pro Tag basierend auf Recovery-Zeit */
export function cyclesPerDay(recoveryMinutes: number): number {
  return 1440 / recoveryMinutes; // 1440 = Minuten pro Tag
}

/** Berechnet effektiven Yield pro Node nach Boosts */
export function effectiveYield(
  baseYield: number,
  boosts: Boost[],
  resourceId: string,
): number {
  let additive = 0;
  let multiplier = 0;
  for (const b of boosts) {
    if (b.affectsResource !== resourceId && b.affectsResource !== "all")
      continue;
    if (b.type === "addYield") additive += b.value;
    if (b.type === "multiplyYield") multiplier += b.value;
  }
  return baseYield * (1 + multiplier) + additive;
}

/** Berechnet effektive Tool-Kosten in Coins nach Rabatten */
export function effectiveToolCostCoins(
  baseCost: number,
  boosts: Boost[],
  resourceId: string,
): number {
  let discount = 0;
  for (const b of boosts) {
    if (b.affectsResource !== resourceId && b.affectsResource !== "all")
      continue;
    if (b.type === "reduceToolCost") discount += b.value;
  }
  return baseCost * (1 - Math.min(discount, 0.99));
}

/** Berechnet effektive Recovery-Zeit in Minuten nach Reduktionen */
export function effectiveRecovery(
  baseMinutes: number,
  boosts: Boost[],
  resourceId: string,
): number {
  let reduction = 0;
  for (const b of boosts) {
    if (b.affectsResource !== resourceId && b.affectsResource !== "all")
      continue;
    if (b.type === "reduceRecovery") reduction += b.value;
  }
  return baseMinutes * (1 - Math.min(reduction, 0.99));
}

// ---------------------------------------------------------------------------
// Hauptberechnung pro Ressource
// ---------------------------------------------------------------------------

export function calculateResource(
  config: ResourceConfig,
  params: GlobalParams,
  activeBoosts: Boost[],
): ResourceResult {
  const recovery = effectiveRecovery(
    config.recoveryMinutes,
    activeBoosts,
    config.id,
  );
  const cycles = cyclesPerDay(recovery);
  const yieldPerNode = effectiveYield(
    config.yieldPerNode,
    activeBoosts,
    config.id,
  );
  const toolCostCoins = effectiveToolCostCoins(
    config.toolCostCoins,
    activeBoosts,
    config.id,
  );

  const productionPerDay = config.nodeCount * cycles * yieldPerNode;

  // Tool-Kosten: 1 Tool pro Node pro Zyklus (Durability = 1)
  const toolsPerDay = (config.nodeCount * cycles) / config.toolDurability;
  const coinCostPerDay = toolsPerDay * toolCostCoins;
  const woodCostPerDay = config.toolCostWood
    ? toolsPerDay * config.toolCostWood
    : undefined;

  // Flower-Kosten (Coins → Flower)
  const flwCostPerDay =
    params.coinToFlowerRatio > 0
      ? coinCostPerDay / params.coinToFlowerRatio
      : 0;

  // P2P Revenue & Profit
  const marketPrice =
    config.id === "wood" ? params.marketPriceWood : params.marketPriceStone;
  const p2pRevenueFlw = productionPerDay * marketPrice * 0.9; // -10% P2P Fee
  const p2pProfitFlw = p2pRevenueFlw - flwCostPerDay;

  return {
    resourceId: config.id,
    cyclesPerDay: cycles,
    productionPerDay,
    coinCostPerDay,
    woodCostPerDay,
    flwCostPerDay,
    p2pRevenueFlw,
    p2pProfitFlw,
  };
}

// ---------------------------------------------------------------------------
// Experiment-Delta (Vergleich Ist vs. Experiment)
// ---------------------------------------------------------------------------

export function calculateDelta(
  baseline: ResourceResult,
  experiment: ResourceResult,
  nftPrice?: number,
): ExperimentDelta {
  const productionDelta =
    experiment.productionPerDay - baseline.productionPerDay;
  const profitDelta = experiment.p2pProfitFlw - baseline.p2pProfitFlw;

  let breakEvenDays: number | null = null;
  if (nftPrice && profitDelta > 0) {
    const raw = Math.ceil(nftPrice / profitDelta);
    breakEvenDays = Number.isFinite(raw) && raw > 0 ? raw : null;
  }

  return {
    resourceId: baseline.resourceId,
    productionDelta,
    profitDelta,
    breakEvenDays,
  };
}

// ---------------------------------------------------------------------------
// Aktive Boosts (Ist vs. Experiment)
// ---------------------------------------------------------------------------

/** Ist: nur owned. Experiment: owned + per Toggle aktivierte !owned Boosts */
export function getActiveBoosts(
  boosts: Boost[],
  experimentBoostIds: ReadonlySet<string>,
  mode: "actual" | "experiment",
): Boost[] {
  const owned = boosts.filter((b) => b.owned);
  if (mode === "actual") return owned;

  const experimental = boosts.filter(
    (b) => !b.owned && experimentBoostIds.has(b.id),
  );
  return [...owned, ...experimental];
}

/** Summe der FLW-Preise experimentell aktivierter, nicht-owned Boosts */
export function sumExperimentBoostPrices(
  boosts: Boost[],
  experimentBoostIds: ReadonlySet<string>,
): number {
  return boosts
    .filter((b) => !b.owned && experimentBoostIds.has(b.id) && b.priceFlw)
    .reduce((sum, b) => sum + (b.priceFlw ?? 0), 0);
}

/** Marginaler P2P-Gewinn/Tag durch Aktivierung eines einzelnen Boosts */
export function calculateBoostMarginalProfit(
  boost: Boost,
  configs: ResourceConfig[],
  params: GlobalParams,
  baseActiveBoosts: Boost[],
): number {
  const withBoost = [...baseActiveBoosts, boost];
  let marginal = 0;

  for (const config of configs) {
    if (
      boost.affectsResource !== config.id &&
      boost.affectsResource !== "all"
    ) {
      continue;
    }
    const baseline = calculateResource(config, params, baseActiveBoosts);
    const boosted = calculateResource(config, params, withBoost);
    marginal += boosted.p2pProfitFlw - baseline.p2pProfitFlw;
  }

  return marginal;
}

/** Break-even in Tagen für einen einzelnen Boost (null wenn nicht berechenbar) */
export function calculateBoostBreakEvenDays(
  boost: Boost,
  configs: ResourceConfig[],
  params: GlobalParams,
  baseActiveBoosts: Boost[],
): number | null {
  if (!boost.priceFlw) return null;
  const marginal = calculateBoostMarginalProfit(
    boost,
    configs,
    params,
    baseActiveBoosts,
  );
  if (!Number.isFinite(marginal) || marginal <= 0) return null;
  const raw = Math.ceil(boost.priceFlw / marginal);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}
