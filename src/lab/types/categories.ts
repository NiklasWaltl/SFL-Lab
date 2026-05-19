import type { Boost, GlobalParams, ResourceConfig } from "./index";

export type CategoryKey =
  | "resources"
  | "crops"
  | "animals"
  | "crafting"
  | "trading"
  | "boosts"
  | "costs"
  | "net";

export type CategoryStatus = "calculated" | "partial" | "placeholder";

export interface CategoryValue {
  key: CategoryKey;
  label: string;
  actual: number;
  experiment: number;
  delta: number;
  shareOfTotal?: number;
  description?: string;
  status: CategoryStatus;
}

export interface CategoryDetailContext {
  globalParams: GlobalParams;
  resources: ResourceConfig[];
  boosts: Boost[];
  actualActiveBoosts: Boost[];
  experimentActiveBoosts: Boost[];
}
