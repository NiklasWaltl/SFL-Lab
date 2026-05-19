import type { CategoryKey } from "./categories";

export interface SimulatorSelection {
  boostId: string | null;
  enabled: boolean;
  overridePriceFlw?: number;
  quantity?: number;
}

export interface SimulatorImpact {
  totalDelta: number;
  breakEvenDays?: number | null;
  roiPercent?: number;
  categoryDeltas: Record<string, number>;
  /** Kategorien, deren Delta heuristisch zugeordnet wurde */
  estimatedCategoryKeys?: CategoryKey[];
}
