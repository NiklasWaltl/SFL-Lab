import type { ExperimentDelta, GlobalParams, ResourceResult } from "../types";

export interface OverviewKpis {
  totalRevenuePerDay: number;
  totalCostsPerDay: number;
  totalProfitPerDay: number;
  simulatedProfitPerDay: number;
  nftProfitDelta: number;
  nftProductionDelta: number;
  woodProfitPerDay: number;
  stoneProfitPerDay: number;
}

export function computeOverviewKpis(
  actualResults: ResourceResult[],
  experimentResults: ResourceResult[],
  deltas: ExperimentDelta[],
  globalParams: GlobalParams,
): OverviewKpis {
  const totalRevenuePerDay = actualResults.reduce(
    (sum, r) => sum + r.p2pRevenueFlw,
    0,
  );

  const totalCostsPerDay = actualResults.reduce((sum, r) => {
    const coinAsFlw = r.coinCostPerDay / globalParams.coinToFlowerRatio;
    return sum + coinAsFlw + r.flwCostPerDay;
  }, 0);

  const totalProfitPerDay = actualResults.reduce(
    (sum, r) => sum + r.p2pProfitFlw,
    0,
  );

  const simulatedProfitPerDay = experimentResults.reduce(
    (sum, r) => sum + r.p2pProfitFlw,
    0,
  );

  const nftProfitDelta = deltas.reduce((sum, d) => sum + d.profitDelta, 0);
  const nftProductionDelta = deltas.reduce(
    (sum, d) => sum + d.productionDelta,
    0,
  );

  const wood = actualResults.find((r) => r.resourceId === "wood");
  const stone = actualResults.find((r) => r.resourceId === "stone");

  return {
    totalRevenuePerDay,
    totalCostsPerDay,
    totalProfitPerDay,
    simulatedProfitPerDay,
    nftProfitDelta,
    nftProductionDelta,
    woodProfitPerDay: wood?.p2pProfitFlw ?? 0,
    stoneProfitPerDay: stone?.p2pProfitFlw ?? 0,
  };
}
