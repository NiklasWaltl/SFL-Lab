import { CROP_BY_NAME, CROP_CONFIGS } from "../config/crops";
import type {
  Boost,
  BoostEffect,
  CropBreakdown,
  CropCalculationLine,
  CropConfig,
  CropDetailLine,
  CropName,
  MarketPriceMap,
  NormalizedFarm,
  PlayerCropPlot,
} from "../types";

interface CropAggregate {
  config: CropConfig;
  plotCount: number;
  totalYieldPerCycle: number;
}

function isCropName(name: string | undefined): name is CropName {
  return !!name && name in CROP_BY_NAME;
}

function getCropPrice(
  config: CropConfig,
  marketPrices: MarketPriceMap,
): number {
  return (
    marketPrices[config.marketKey] ??
    marketPrices[config.marketKey.toLowerCase()] ??
    0
  );
}

function cropBoostApplies(effect: BoostEffect, cropName: CropName): boolean {
  const target = effect.resource.toLowerCase();
  return (
    target === "all" || target === "crops" || target === cropName.toLowerCase()
  );
}

function getBoostedCropInputs(
  aggregate: CropAggregate,
  activeBoosts: Boost[],
): {
  plotCount: number;
  yieldPerCycle: number;
  harvestMinutes: number;
} {
  let additiveYield = 0;
  let yieldMultiplier = 0;
  let recoveryReduction = 0;
  let extraPlots = 0;

  for (const boost of activeBoosts) {
    for (const effect of boost.effects) {
      if (!cropBoostApplies(effect, aggregate.config.name)) {
        continue;
      }

      if (effect.effectType === "addYield") additiveYield += effect.value;
      if (effect.effectType === "multiplyYield")
        yieldMultiplier += effect.value;
      if (effect.effectType === "reduceRecovery") {
        recoveryReduction += effect.value;
      }
      if (effect.effectType === "addNodes") extraPlots += effect.value;
    }
  }

  const baseYieldPerCycle =
    aggregate.plotCount > 0
      ? aggregate.totalYieldPerCycle / aggregate.plotCount
      : 0;

  return {
    plotCount: Math.max(0, aggregate.plotCount + extraPlots),
    yieldPerCycle: Math.max(
      0,
      baseYieldPerCycle * (1 + yieldMultiplier) + additiveYield,
    ),
    harvestMinutes:
      aggregate.config.harvestMinutes * (1 - Math.min(recoveryReduction, 0.99)),
  };
}

function aggregateCropPlots(cropPlots: PlayerCropPlot[]): CropAggregate[] {
  const aggregates = new Map<CropName, CropAggregate>();

  for (const plot of cropPlots) {
    if (!isCropName(plot.name)) {
      continue;
    }

    const config = CROP_BY_NAME[plot.name];
    const current = aggregates.get(plot.name) ?? {
      config,
      plotCount: 0,
      totalYieldPerCycle: 0,
    };

    current.plotCount += 1;
    current.totalYieldPerCycle += plot.amount ?? 1;
    aggregates.set(plot.name, current);
  }

  return [...aggregates.values()];
}

/**
 * Teilberechnung: Die Portal-Daten liefern aktuelle Plot-Belegung, aber keine
 * vollständige Rotation, Leerlaufzeiten oder Compost-/Bee-/Event-Historie.
 */
export function calculateCropBreakdown(
  farm: NormalizedFarm | null,
  marketPrices: MarketPriceMap,
  activeBoosts: Boost[],
): CropBreakdown {
  const aggregates = aggregateCropPlots(farm?.cropPlots ?? []);

  const lines: CropCalculationLine[] = aggregates.map((aggregate) => {
    const boosted = getBoostedCropInputs(aggregate, activeBoosts);
    const cyclesPerDay =
      boosted.harvestMinutes > 0 ? 1440 / boosted.harvestMinutes : 0;
    const productionPerDay =
      boosted.plotCount * boosted.yieldPerCycle * cyclesPerDay;
    const seedCostPerDay =
      boosted.plotCount * cyclesPerDay * aggregate.config.seedCostFlw;
    const priceFlw = getCropPrice(aggregate.config, marketPrices);
    const revenueFlw = productionPerDay * priceFlw;

    return {
      cropName: aggregate.config.name,
      label: aggregate.config.label,
      plotCount: boosted.plotCount,
      yieldPerCycle: boosted.yieldPerCycle,
      cyclesPerDay,
      productionPerDay,
      seedCostPerDay,
      priceFlw,
      revenueFlw,
      netFlw: revenueFlw - seedCostPerDay,
    };
  });

  return {
    revenueFlw: lines.reduce((sum, line) => sum + line.revenueFlw, 0),
    costFlw: lines.reduce((sum, line) => sum + line.seedCostPerDay, 0),
    netFlw: lines.reduce((sum, line) => sum + line.netFlw, 0),
    lines,
  };
}

export function getCropDetailLines(
  farm: NormalizedFarm | null,
  marketPrices: MarketPriceMap,
  actualActiveBoosts: Boost[],
  experimentActiveBoosts: Boost[],
): CropDetailLine[] {
  const actual = calculateCropBreakdown(farm, marketPrices, actualActiveBoosts);
  const experiment = calculateCropBreakdown(
    farm,
    marketPrices,
    experimentActiveBoosts,
  );
  const actualByName = new Map(
    actual.lines.map((line) => [line.cropName, line]),
  );
  const experimentByName = new Map(
    experiment.lines.map((line) => [line.cropName, line]),
  );

  return CROP_CONFIGS.flatMap((config) => {
    const actualLine = actualByName.get(config.name);
    const experimentLine = experimentByName.get(config.name);

    if (!actualLine && !experimentLine) {
      return [];
    }

    return [
      {
        cropName: config.name,
        label: config.label,
        plotCount: actualLine?.plotCount ?? experimentLine?.plotCount ?? 0,
        priceFlw: actualLine?.priceFlw ?? experimentLine?.priceFlw ?? 0,
        actualProductionPerDay: actualLine?.productionPerDay ?? 0,
        experimentProductionPerDay: experimentLine?.productionPerDay ?? 0,
        actualRevenueFlw: actualLine?.revenueFlw ?? 0,
        experimentRevenueFlw: experimentLine?.revenueFlw ?? 0,
        actualSeedCostFlw: actualLine?.seedCostPerDay ?? 0,
        experimentSeedCostFlw: experimentLine?.seedCostPerDay ?? 0,
        actualNetFlw: actualLine?.netFlw ?? 0,
        experimentNetFlw: experimentLine?.netFlw ?? 0,
        delta: (experimentLine?.netFlw ?? 0) - (actualLine?.netFlw ?? 0),
      },
    ];
  });
}
