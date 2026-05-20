import type {
  AnyBoost,
  BoostEffect,
  FarmSkillState,
  NftBoost,
  PlayerData,
  SkillBoost,
} from "../types";

export function isNftBoost(boost: AnyBoost): boost is NftBoost {
  return boost.type === "NFT";
}

export function isSkillBoost(boost: AnyBoost): boost is SkillBoost {
  return boost.type === "SKILL";
}

export function isBoostOwned(boost: AnyBoost): boolean {
  return (boost.apiOwned ?? boost.owned) === true;
}

function hasApiAsset(
  assets: Record<string, unknown[]> | undefined,
  label: string,
): boolean | undefined {
  if (!assets) return undefined;

  const entries = assets[label];
  return Array.isArray(entries) && entries.length > 0;
}

function hasApiSkill(
  skills: Record<string, number | boolean> | undefined,
  label: string,
): boolean | undefined {
  if (!skills) return undefined;

  const normalizedLabel = label.toLowerCase();
  return Object.keys(skills).some(
    (key) => key.toLowerCase() === normalizedLabel,
  );
}

export function applyApiBoosts(
  boosts: AnyBoost[],
  playerData: PlayerData | null,
): AnyBoost[] {
  if (playerData === null) {
    return boosts.map((boost) => ({ ...boost, apiOwned: undefined }));
  }

  return boosts.map((boost) => {
    if (isSkillBoost(boost)) {
      return {
        ...boost,
        apiOwned: hasApiSkill(playerData.bumpkin?.skills, boost.label),
      };
    }

    const collectibleOwned = hasApiAsset(playerData.collectibles, boost.label);
    const buildingOwned = hasApiAsset(playerData.buildings, boost.label);

    return {
      ...boost,
      apiOwned:
        collectibleOwned === undefined && buildingOwned === undefined
          ? undefined
          : collectibleOwned === true || buildingOwned === true,
    };
  });
}

export function getTotalSkillPoints(farmLevel: number): number {
  return Math.max(0, Math.floor(farmLevel));
}

export function getSkillPointsSpent(skills: SkillBoost[]): number {
  return skills
    .filter(isBoostOwned)
    .reduce((sum, skill) => sum + skill.skillPointCost, 0);
}

export function canActivateSkill(
  skill: SkillBoost,
  farmSkillState: FarmSkillState,
): boolean {
  if (isBoostOwned(skill)) return true;

  const available =
    farmSkillState.skillPointsTotal - farmSkillState.skillPointsSpent;

  return available >= skill.skillPointCost;
}

export function effectTargetsResource(
  effect: BoostEffect,
  resourceId: string,
): boolean {
  return effect.resource === resourceId || effect.resource === "all";
}

export function getPrimaryBoostEffect(boost: AnyBoost): BoostEffect {
  return (
    boost.effects[0] ?? {
      resource: "all",
      effectType: "addYield",
      value: 0,
    }
  );
}
