// SFL-Lab – zentrale TypeScript-Typen
// Alle Typen für den Experiment-Modus und Ist-Zustand werden hier definiert

// ---------------------------------------------------------------------------
// Globale Parameter (editierbar durch den Nutzer)
// ---------------------------------------------------------------------------
export interface GlobalParams {
  coinToFlowerRatio: number; // Coins pro 1 FLW
  marketPriceWood: number; // FLW pro 1 Wood (P2P)
  marketPriceStone: number; // FLW pro 1 Stone (P2P)
}

// ---------------------------------------------------------------------------
// Ressource-Konfiguration (Ist-Zustand der Farm)
// ---------------------------------------------------------------------------
export interface ResourceConfig {
  id: string; // z.B. "wood", "stone"
  label: string;
  nodeCount: number; // Anzahl Bäume/Knoten
  yieldPerNode: number; // Ø Ressource pro Node
  recoveryMinutes: number; // Regenerationszeit in Minuten
  toolCostCoins: number; // Coin-Kosten pro Tool
  toolCostWood?: number; // Wood-Kosten pro Tool (nur bei Stone etc.)
  toolDurability: number; // Haltbarkeit (Standard: 1)
}

// ---------------------------------------------------------------------------
// Boost-Effekte und Domänen-Modelle
// ---------------------------------------------------------------------------
export type BoostEffectType =
  | "addYield" // +X Yield pro Node (absolut)
  | "multiplyYield" // +X% Yield pro Node (relativ)
  | "reduceToolCost" // -X% Tool-Kosten
  | "reduceRecovery" // -X% Recovery-Zeit
  | "addNodes"; // +X zusätzliche Nodes

export type BoostType = BoostEffectType;

export interface BoostEffect {
  resource: string; // "wood", "stone", "all", ...
  effectType: BoostEffectType;
  value: number; // absoluter Wert oder Prozentsatz (0.1 = 10%)
}

interface BaseBoost {
  id: string;
  label: string;
  type: "NFT" | "SKILL";
  owned: boolean; // true = Ist-Zustand, false = Experiment
  effects: BoostEffect[];
}

export interface NftBoost extends BaseBoost {
  type: "NFT";
  priceFlw: number; // Kaufpreis in FLW
}

export interface SkillBoost extends BaseBoost {
  type: "SKILL";
  skillPointCost: 1 | 2 | 3;
}

export interface FarmSkillState {
  farmLevel: number;
  skillPointsTotal: number;
  skillPointsSpent: number;
}

export type AnyBoost = NftBoost | SkillBoost;
export type Boost = AnyBoost;

export interface FarmState {
  resources: ResourceConfig[];
  globalParams: GlobalParams;
}

// ---------------------------------------------------------------------------
// Berechnungsergebnis pro Ressource
// ---------------------------------------------------------------------------
export interface ResourceResult {
  resourceId: string;
  cyclesPerDay: number;
  productionPerDay: number;
  coinCostPerDay: number;
  woodCostPerDay?: number;
  flwCostPerDay: number;
  p2pRevenueFlw: number;
  p2pProfitFlw: number;
}

// ---------------------------------------------------------------------------
// Experiment-Vergleich
// ---------------------------------------------------------------------------
export interface ExperimentDelta {
  resourceId: string;
  productionDelta: number; // +/- gegenüber Ist
  profitDelta: number; // +/- FLW/Tag
  breakEvenDays: number | null; // null wenn kein Kaufpreis bekannt
}

// ---------------------------------------------------------------------------
// Re-Exports (alphabetisch nach Dateiname)
// ---------------------------------------------------------------------------
export type {
  Category,
  CategoryDetailContext,
  CategoryKey,
  CategoryStatus,
  CategoryValue,
} from "./categories";
export type {
  CropBreakdown,
  CropCalculationLine,
  CropConfig,
  CropDetailLine,
  CropName,
  CropPriceSource,
} from "./crops";
export type { MarketPriceMap, MarketPricesResponse } from "./market";
export type {
  NftAsset,
  NftSimulationParams,
  NftSimulationResult,
  NftSimulationSummary,
} from "./nft";
export type {
  Bumpkin,
  NormalizedFarm,
  PlayerCropPlot,
  PlayerData,
} from "./player";
export type { PortfolioPosition } from "./portfolio";
export type { Scenario, ScenarioData, ScenarioPortfolioData } from "./scenario";
export type { SimulatorImpact, SimulatorSelection } from "./simulator";
