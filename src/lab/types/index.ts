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
// Boost / Modifikator (NFT oder Skill)
// ---------------------------------------------------------------------------
export type BoostType =
  | "addYield" // +X Yield pro Node (absolut)
  | "multiplyYield" // +X% Yield pro Node (relativ)
  | "reduceToolCost" // -X% Tool-Kosten
  | "reduceRecovery" // -X% Recovery-Zeit
  | "addNodes"; // +X zusätzliche Nodes

export type BoostSource = "nft" | "skill";

export interface Boost {
  id: string;
  label: string;
  source: BoostSource;
  affectsResource: string; // "wood", "stone", "all", ...
  type: BoostType;
  value: number; // absoluter Wert oder Prozentsatz (0.1 = 10%)
  priceFlw?: number; // Kaufpreis in FLW (nur bei NFTs)
  owned: boolean; // true = Ist-Zustand, false = Experiment
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
