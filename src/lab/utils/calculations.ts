// SFL-Lab – Berechnungslogik (pure functions, kein UI)
// Alle Formeln zentral hier – Komponenten nur für Darstellung

import type {
  AnyBoost,
  FarmState,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
  ExperimentDelta,
} from "../types";
import { effectTargetsResource, isBoostOwned, isNftBoost } from "./boosts";

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
  boosts: AnyBoost[],
  resourceId: string,
): number {
  let additive = 0;
  let multiplier = 0;
  for (const boost of boosts) {
    for (const effect of boost.effects) {
      if (!effectTargetsResource(effect, resourceId)) continue;
      if (effect.effectType === "addYield") additive += effect.value;
      if (effect.effectType === "multiplyYield") multiplier += effect.value;
    }
  }
  return baseYield * (1 + multiplier) + additive;
}

/** Berechnet effektive Tool-Kosten in Coins nach Rabatten */
export function effectiveToolCostCoins(
  baseCost: number,
  boosts: AnyBoost[],
  resourceId: string,
): number {
  let discount = 0;
  for (const boost of boosts) {
    for (const effect of boost.effects) {
      if (!effectTargetsResource(effect, resourceId)) continue;
      if (effect.effectType === "reduceToolCost") discount += effect.value;
    }
  }
  return baseCost * (1 - Math.min(discount, 0.99));
}

/** Berechnet effektive Recovery-Zeit in Minuten nach Reduktionen */
export function effectiveRecovery(
  baseMinutes: number,
  boosts: AnyBoost[],
  resourceId: string,
): number {
  let reduction = 0;
  for (const boost of boosts) {
    for (const effect of boost.effects) {
      if (!effectTargetsResource(effect, resourceId)) continue;
      if (effect.effectType === "reduceRecovery") reduction += effect.value;
    }
  }
  return baseMinutes * (1 - Math.min(reduction, 0.99));
}

/** Wendet die übergebenen Boosts auf eine Farm-Konfiguration an. */
export function applyBoosts(
  baseState: FarmState,
  boosts: AnyBoost[],
): FarmState {
  return {
    ...baseState,
    resources: baseState.resources.map((resource) => {
      let next = { ...resource };

      for (const boost of boosts) {
        for (const effect of boost.effects) {
          if (!effectTargetsResource(effect, resource.id)) continue;

          if (effect.effectType === "addYield") {
            next = {
              ...next,
              yieldPerNode: next.yieldPerNode + effect.value,
            };
          }
          if (effect.effectType === "multiplyYield") {
            next = {
              ...next,
              yieldPerNode: next.yieldPerNode * (1 + effect.value),
            };
          }
          if (effect.effectType === "reduceToolCost") {
            next = {
              ...next,
              toolCostCoins:
                next.toolCostCoins * (1 - Math.min(effect.value, 0.99)),
            };
          }
          if (effect.effectType === "reduceRecovery") {
            next = {
              ...next,
              recoveryMinutes:
                next.recoveryMinutes * (1 - Math.min(effect.value, 0.99)),
            };
          }
          if (effect.effectType === "addNodes") {
            next = {
              ...next,
              nodeCount: next.nodeCount + effect.value,
            };
          }
        }
      }

      return next;
    }),
  };
}

// ---------------------------------------------------------------------------
// Hauptberechnung pro Ressource
// ---------------------------------------------------------------------------

export function calculateResource(
  config: ResourceConfig,
  params: GlobalParams,
  activeBoosts: AnyBoost[],
  marketPriceWood: number,
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
    config.id === "wood" ? marketPriceWood : params.marketPriceStone;
  const woodCostFlwPerDay =
    woodCostPerDay !== undefined && marketPriceWood > 0
      ? woodCostPerDay * marketPriceWood * 0.9
      : 0;
  const p2pRevenueFlw = productionPerDay * marketPrice * 0.9; // -10% P2P Fee
  const p2pProfitFlw = p2pRevenueFlw - flwCostPerDay - woodCostFlwPerDay;

  return {
    resourceId: config.id,
    cyclesPerDay: cycles,
    productionPerDay,
    coinCostPerDay,
    woodCostPerDay,
    woodCostFlwPerDay,
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
  boosts: AnyBoost[],
  experimentBoostIds: ReadonlySet<string>,
  mode: "actual" | "experiment",
): AnyBoost[] {
  const owned = boosts.filter(isBoostOwned);
  if (mode === "actual") return owned;

  const experimental = boosts.filter(
    (b) => !isBoostOwned(b) && experimentBoostIds.has(b.id),
  );
  return [...owned, ...experimental];
}

/** Summe der FLW-Preise experimentell aktivierter, nicht-owned Boosts */
export function sumExperimentBoostPrices(
  boosts: AnyBoost[],
  experimentBoostIds: ReadonlySet<string>,
): number {
  return boosts
    .filter(
      (boost) =>
        isNftBoost(boost) &&
        !isBoostOwned(boost) &&
        experimentBoostIds.has(boost.id) &&
        boost.priceFlw > 0,
    )
    .reduce((sum, boost) => sum + boost.priceFlw, 0);
}

/** Marginaler P2P-Gewinn/Tag durch Aktivierung eines einzelnen Boosts */
export function calculateBoostMarginalProfit(
  boost: AnyBoost,
  configs: ResourceConfig[],
  params: GlobalParams,
  baseActiveBoosts: AnyBoost[],
): number {
  const withBoost = [...baseActiveBoosts, boost];
  let marginal = 0;

  for (const config of configs) {
    const affectsConfig = boost.effects.some((effect) =>
      effectTargetsResource(effect, config.id),
    );
    if (!affectsConfig) {
      continue;
    }
    const baseline = calculateResource(
      config,
      params,
      baseActiveBoosts,
      params.marketPriceWood,
    );
    const boosted = calculateResource(
      config,
      params,
      withBoost,
      params.marketPriceWood,
    );
    marginal += boosted.p2pProfitFlw - baseline.p2pProfitFlw;
  }

  return marginal;
}

/** Break-even in Tagen für einen einzelnen Boost (null wenn nicht berechenbar) */
export function calculateBoostBreakEvenDays(
  boost: AnyBoost,
  configs: ResourceConfig[],
  params: GlobalParams,
  baseActiveBoosts: AnyBoost[],
): number | null {
  if (!isNftBoost(boost) || !boost.priceFlw) return null;
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
