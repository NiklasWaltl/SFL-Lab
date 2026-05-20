import type {
  AnyBoost,
  BoostEffect,
  FarmSkillState,
  NftBoost,
  SkillBoost,
} from "../types";

export function isNftBoost(boost: AnyBoost): boost is NftBoost {
  return boost.type === "NFT";
}

export function isSkillBoost(boost: AnyBoost): boost is SkillBoost {
  return boost.type === "SKILL";
}

export function getTotalSkillPoints(farmLevel: number): number {
  return Math.max(0, Math.floor(farmLevel));
}

export function getSkillPointsSpent(skills: SkillBoost[]): number {
  return skills
    .filter((skill) => skill.owned)
    .reduce((sum, skill) => sum + skill.skillPointCost, 0);
}

export function canActivateSkill(
  skill: SkillBoost,
  farmSkillState: FarmSkillState,
): boolean {
  if (skill.owned) return true;

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
