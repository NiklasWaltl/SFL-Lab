// SFL-Lab – NFT- und Skill-Boost-Definitionen
// Neue Boosts einfach hier ergänzen – keine Komponente muss geändert werden

import type { AnyBoost, NftBoost, SkillBoost } from "../types";

// label muss dem SFL-Skill-/Collectible-Namen entsprechen (case-insensitive)
// Referenz: sunflower-land/src/features/game/types/skills.ts

export const NFT_BOOSTS: NftBoost[] = [
  {
    id: "woody_the_beaver",
    label: "Woody the Beaver",
    type: "NFT",
    priceFlw: 12,
    owned: false,
    effects: [
      {
        resource: "wood",
        effectType: "addYield",
        value: 0.2,
      },
    ],
  },
  {
    id: "stone_fence",
    label: "Stone Fence",
    type: "NFT",
    priceFlw: 8,
    owned: false,
    effects: [
      {
        resource: "stone",
        effectType: "reduceRecovery",
        value: 0.2,
      },
    ],
  },
];

export const SKILL_BOOSTS: SkillBoost[] = [
  {
    id: "lumberjack_extra",
    label: "Lumberjack's Extra",
    type: "SKILL",
    skillPointCost: 1,
    owned: false,
    effects: [
      {
        resource: "wood",
        effectType: "addYield",
        value: 0.1,
      },
    ],
  },
  {
    id: "stone_masons_focus",
    label: "Stone Mason's Focus",
    type: "SKILL",
    skillPointCost: 2,
    owned: false,
    effects: [
      {
        resource: "stone",
        effectType: "addYield",
        value: 0.1,
      },
    ],
  },
];

export const BOOSTS: AnyBoost[] = [...NFT_BOOSTS, ...SKILL_BOOSTS];
