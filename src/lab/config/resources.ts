// SFL-Lab – Ressource-Grundkonfiguration (Ist-Zustand als Startwert)
// Werte entsprechen der verifizierten Farm (Stand: 2026-05-19)

import type { ResourceConfig } from "../types";

export const RESOURCE_DEFAULTS: ResourceConfig[] = [
  {
    id: "wood",
    label: "Wood",
    nodeCount: 24,
    yieldPerNode: 1.7,
    recoveryMinutes: 108, // 1h 48min
    toolCostCoins: 16,
    toolDurability: 1,
  },
  {
    id: "stone",
    label: "Stone",
    nodeCount: 20,
    yieldPerNode: 2.2,
    recoveryMinutes: 192, // 3h 12min
    // toolCostCoins Stone: ~44 Coins/Chop
    // Ableitung: 6635 Coins/Tag ÷ 150 Chops/Tag (20 Nodes × 7.5 Cycles)
    // Offiziell: Stone Pickaxe ~880 Coins, ~20 Nutzungen = 44/Chop
    toolCostCoins: 44,
    toolDurability: 1,
  },
];
