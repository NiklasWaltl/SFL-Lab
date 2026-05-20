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

export interface CropCalculationLine {
  cropName: CropName;
  label: string;
  plotCount: number;
  yieldPerCycle: number;
  cyclesPerDay: number;
  productionPerDay: number;
  seedCostPerDay: number;
  priceFlw: number;
  revenueFlw: number;
  netFlw: number;
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
  priceFlw: number;
  actualProductionPerDay: number;
  experimentProductionPerDay: number;
  actualRevenueFlw: number;
  experimentRevenueFlw: number;
  actualSeedCostFlw: number;
  experimentSeedCostFlw: number;
  actualNetFlw: number;
  experimentNetFlw: number;
  delta: number;
}
