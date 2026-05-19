// SFL-Lab – NFT & Skill Boost-Definitionen
// Neue Boosts einfach hier ergänzen – keine Komponente muss geändert werden

import type { Boost } from "../types";

export const BOOSTS: Boost[] = [
  // --- WOOD: Skills ---
  {
    id: "lumberjack_extra",
    label: "Lumberjack's Extra",
    source: "skill",
    affectsResource: "wood",
    type: "addYield",
    value: 0.1,
    owned: true,
  },
  {
    id: "tough_tree",
    label: "Tough Tree x3",
    source: "skill",
    affectsResource: "wood",
    type: "addYield",
    value: 0.2,
    owned: true,
  },
  {
    id: "native_1",
    label: "Native +1",
    source: "skill",
    affectsResource: "wood",
    type: "addYield",
    value: 0.2,
    owned: true,
  },
  {
    id: "fellers_discount",
    label: "Feller's Discount",
    source: "skill",
    affectsResource: "wood",
    type: "reduceToolCost",
    value: 0.2,
    owned: true,
  },
  {
    id: "time_skill_tree",
    label: "Time Skill Tree Charge",
    source: "skill",
    affectsResource: "wood",
    type: "reduceRecovery",
    value: 0.1,
    owned: true,
  },
  // --- WOOD: NFTs ---
  {
    id: "tiki_totem",
    label: "Tiki Totem",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    value: 0.1,
    priceFlw: undefined,
    owned: true,
  },
  {
    id: "squirrel",
    label: "Squirrel",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    value: 0.1,
    priceFlw: undefined,
    owned: true,
  },
  // --- STONE: (Boosts noch ergänzen) ---
];
