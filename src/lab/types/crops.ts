export type CropName =
  | "Sunflower"
  | "Potato"
  | "Pumpkin"
  | "Carrot"
  | "Cabbage"
  | "Soybean"
  | "Beetroot"
  | "Cauliflower"
  | "Parsnip"
  | "Eggplant"
  | "Corn"
  | "Radish"
  | "Wheat"
  | "Kale"
  | "Barley"
  | "Rhubarb"
  | "Zucchini"
  | "Yam"
  | "Broccoli"
  | "Pepper"
  | "Onion"
  | "Turnip"
  | "Artichoke";

export type CropKey = CropName;

export interface CropConfig {
  name: CropName;
  label: string;
  marketKey: CropName;
  // seedCostCoins: offizieller Seed-Shop-Preis in Coins
  // Quelle: sunflower-land/src/features/game/types/crops.ts (CROP_SEEDS[x].price)
  // FLW-Umrechnung: seedCostCoins / coinToFlowerRatio zur Laufzeit
  seedCostCoins: number;
  harvestMinutes: number;
}

export type CropPriceSource = "live" | "manual" | "missing";

export interface CropCalculationLine {
  cropName: CropName;
  label: string;
  plotCount: number;
  yieldPerCycle: number;
  cyclesPerDay: number;
  productionPerDay: number;
  seedCostPerDay: number;
  priceFlw: number | null;
  priceSource: CropPriceSource;
  revenueFlw: number | null;
  netFlw: number | null;
}

export interface CropBreakdown {
  revenueFlw: number;
  costFlw: number;
  netFlw: number;
  lines: CropCalculationLine[];
}

export interface CropDetailLine {
  cropName: CropName;
  label: string;
  plotCount: number;
  priceFlw: number | null;
  priceSource: CropPriceSource;
  actualProductionPerDay: number;
  experimentProductionPerDay: number;
  actualRevenueFlw: number | null;
  experimentRevenueFlw: number | null;
  actualSeedCostFlw: number;
  experimentSeedCostFlw: number;
  actualNetFlw: number | null;
  experimentNetFlw: number | null;
  delta: number | null;
}
