// SFL-Lab – NFT & Skill Boost-Definitionen
// Neue Boosts einfach hier ergänzen – keine Komponente muss geändert werden

import type { Boost } from "../types";

export const BOOSTS: Boost[] = [
  // ─────────────────────────────────────────────────────────────────────────
  // WOOD – Skills (owned: true)
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // WOOD – NFTs (owned: true)
  // ─────────────────────────────────────────────────────────────────────────
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

  // ─────────────────────────────────────────────────────────────────────────
  // WOOD – NFTs (owned: false) – Experiment-Toggles
  // Quellen: sfl.world, Scribd NFT-Army-Guide, Community-Datenlage
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "golden_beaver",
    label: "Golden Beaver",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    value: 0.15,
    priceFlw: 45,
    owned: false,
  },
  {
    id: "woody_the_beaver",
    label: "Woody the Beaver",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    // +0.2 Wood per chop (avg 4 base → +5 %)
    value: 0.2,
    priceFlw: 12,
    owned: false,
  },
  {
    id: "apprentice_beaver",
    label: "Apprentice Beaver",
    source: "nft",
    affectsResource: "wood",
    // Trees recover 50 % faster → ~reduceRecovery 0.5
    type: "reduceRecovery",
    value: 0.5,
    priceFlw: 1.9,
    owned: false,
  },
  {
    id: "foreman_beaver",
    label: "Foreman Beaver",
    source: "nft",
    affectsResource: "wood",
    // Chop trees without axes (axe cost = 0)
    type: "reduceToolCost",
    value: 1.0,
    priceFlw: 60,
    owned: false,
  },
  {
    id: "wood_nymph_wendy",
    label: "Wood Nymph Wendy",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    // +0.2 Wood per chop
    value: 0.2,
    priceFlw: 25,
    owned: false,
  },
  {
    id: "paul_the_lumberjack",
    label: "Paul the Lumberjack",
    source: "nft",
    affectsResource: "wood",
    type: "addYield",
    // +1.0 Wood per chop
    value: 1.0,
    priceFlw: 120,
    owned: false,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // STONE – NFTs (owned: false) – Experiment-Toggles
  // ─────────────────────────────────────────────────────────────────────────
  {
    id: "emerald_turtle",
    label: "Emerald Turtle",
    source: "nft",
    affectsResource: "stone",
    type: "addYield",
    // +0.1 Stone per mine
    value: 0.1,
    priceFlw: 18,
    owned: false,
  },
  {
    id: "tin_turtle",
    label: "Tin Turtle",
    source: "nft",
    affectsResource: "stone",
    type: "addYield",
    // +0.1 Stone per mine
    value: 0.1,
    priceFlw: 3.5,
    owned: false,
  },
  {
    id: "rocky_the_mole",
    label: "Rocky the Mole",
    source: "nft",
    affectsResource: "stone",
    type: "addYield",
    // +0.25 Stone per mine
    value: 0.25,
    priceFlw: 35,
    owned: false,
  },
  {
    id: "stone_fence",
    label: "Stone Fence",
    source: "nft",
    affectsResource: "stone",
    type: "reduceRecovery",
    // Stone regenerates 20 % faster
    value: 0.2,
    priceFlw: 8,
    owned: false,
  },
];
