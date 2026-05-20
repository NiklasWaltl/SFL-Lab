import type { BoostEffectType } from "./index";
import type { ResourceResult } from "./index";
import type { CategoryKey } from "./categories";
import type { SimulatorImpact } from "./simulator";

/** View model for a selectable NFT / boost in the simulator */
export interface NftAsset {
  key: string;
  label: string;
  basePrice?: number;
  type: "NFT";
  owned: boolean;
  resource: string;
  boostType: BoostEffectType;
  effectValue: number;
}

/** User-controlled simulation parameters (no selected asset key) */
export interface NftSimulationParams {
  enabled: boolean;
  overridePriceFlw?: number;
  quantity?: number;
}

/** Per-resource outcome of a single-boost simulation run */
export type NftSimulationResult = ResourceResult;

/** Aggregated economics for the current selection */
export interface NftSimulationSummary {
  impact: SimulatorImpact;
  totalValue: number;
  marginalValues: Record<string, number>;
  marginalPrices: Record<string, number>;
  estimatedCategoryKeys?: CategoryKey[];
}
