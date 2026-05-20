// SFL-Lab – Berechnungslogik für den Portfolio-Tab (pure functions)
import type { Boost, ResourceConfig, GlobalParams } from "../types";
import type { PortfolioPosition } from "../types";
import {
  calculateBoostMarginalProfit,
  calculateBoostBreakEvenDays,
} from "./calculations";

export function buildPortfolioPositions(
  boosts: Boost[],
  resources: ResourceConfig[],
  params: GlobalParams,
  activeBoosts: Boost[],
  purchaseDates: Record<string, string>, // boostId -> ISO date string
  currentValues: Record<string, number>, // boostId -> FLW
): PortfolioPosition[] {
  return boosts
    .filter((b) => b.owned || b.priceFlw !== undefined)
    .map((b) => {
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

      const purchasePriceFlw = b.priceFlw ?? null;
      const currentValueFlw = currentValues[b.id] ?? purchasePriceFlw;

      let roiPercent: number | null = null;
      if (purchasePriceFlw && currentValueFlw !== null) {
        roiPercent =
          ((currentValueFlw - purchasePriceFlw) / purchasePriceFlw) * 100;
      }

      let daysSincePurchase: number | null = null;
      let earnedSoPurchaseFlw: number | null = null;
      if (purchaseDates[b.id]) {
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
        source: b.source,
        affectsResource: b.affectsResource,
        purchasePriceFlw,
        currentValueFlw,
        dailyValueFlw,
        breakEvenDays,
        roiPercent,
        daysSincePurchase,
        earnedSoPurchaseFlw,
        owned: b.owned,
      } satisfies PortfolioPosition;
    });
}
