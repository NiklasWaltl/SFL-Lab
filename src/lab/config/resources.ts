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
    toolCostCoins: 16,
    toolCostWood: 3,
    toolDurability: 1,
  },
];
