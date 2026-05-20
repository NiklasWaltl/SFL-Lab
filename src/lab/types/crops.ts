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

export interface CropConfig {
  name: CropName;
  label: string;
  marketKey: CropName;
  seedCostFlw: number;
  harvestMinutes: number;
}

export type CropPriceSource = "market" | "missing";

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
