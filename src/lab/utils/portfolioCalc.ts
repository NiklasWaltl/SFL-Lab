// SFL-Lab – Berechnungslogik für den Portfolio-Tab (pure functions)
import type { AnyBoost, ResourceConfig, GlobalParams } from "../types";
import type { PortfolioPosition } from "../types";
import {
  calculateBoostMarginalProfit,
  calculateBoostBreakEvenDays,
} from "./calculations";
import {
  getPrimaryBoostEffect,
  isBoostOwned,
  isNftBoost,
  isSkillBoost,
} from "./boosts";

export function buildPortfolioPositions(
  boosts: AnyBoost[],
  resources: ResourceConfig[],
  params: GlobalParams,
  activeBoosts: AnyBoost[],
  purchaseDates: Record<string, string>, // boostId -> ISO date string
  currentValues: Record<string, number>, // boostId -> FLW
): PortfolioPosition[] {
  return boosts.map((b) => {
    const primaryEffect = getPrimaryBoostEffect(b);
    const dailyValueFlw = calculateBoostMarginalProfit(
      b,
      resources,
      params,
      activeBoosts.filter((ab) => ab.id !== b.id),
    );

    const breakEvenDays = calculateBoostBreakEvenDays(
      b,
      resources,
      params,
      activeBoosts.filter((ab) => ab.id !== b.id),
    );

    const purchasePriceFlw = isNftBoost(b) ? b.priceFlw : null;
    const currentValueFlw = currentValues[b.id] ?? purchasePriceFlw;

    let roiPercent: number | null = null;
    if (purchasePriceFlw && currentValueFlw !== null) {
      roiPercent =
        ((currentValueFlw - purchasePriceFlw) / purchasePriceFlw) * 100;
    }

    let daysSincePurchase: number | null = null;
    let earnedSoPurchaseFlw: number | null = null;
    if (isNftBoost(b) && purchaseDates[b.id]) {
      const bought = new Date(purchaseDates[b.id]);
      const now = new Date();
      daysSincePurchase = Math.max(
        0,
        Math.floor((now.getTime() - bought.getTime()) / 86_400_000),
      );
      earnedSoPurchaseFlw = daysSincePurchase * dailyValueFlw;
    }

    return {
      id: b.id,
      label: b.label,
      type: b.type,
      resource: primaryEffect.resource,
      skillPointCost: isSkillBoost(b) ? b.skillPointCost : undefined,
      purchasePriceFlw,
      currentValueFlw,
      dailyValueFlw,
      breakEvenDays,
      roiPercent,
      daysSincePurchase,
      earnedSoPurchaseFlw,
      owned: isBoostOwned(b),
    } satisfies PortfolioPosition;
  });
}
