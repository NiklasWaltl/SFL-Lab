import { useMemo } from "react";
import type { FarmSkillState, PlayerData, SkillBoost } from "../types";
import { getSkillPointsSpent, getTotalSkillPoints } from "../utils/boosts";

function isOwnedSkillValue(value: number | boolean): boolean {
  return value === true || (typeof value === "number" && value > 0);
}

function normalizeSkillKey(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getOwnedSkillLookup(
  skills: Record<string, number | boolean> | undefined,
): Record<string, boolean> | null {
  if (!skills) return null;

  return Object.entries(skills).reduce<Record<string, boolean>>(
    (lookup, [key, value]) => {
      if (!isOwnedSkillValue(value)) return lookup;

      lookup[key] = true;
      lookup[normalizeSkillKey(key)] = true;
      return lookup;
    },
    {},
  );
}

function isSkillOwnedByFarm(
  skill: SkillBoost,
  ownedSkillLookup: Record<string, boolean>,
): boolean {
  return Boolean(
    ownedSkillLookup[skill.id] ||
      ownedSkillLookup[skill.label] ||
      ownedSkillLookup[normalizeSkillKey(skill.id)] ||
      ownedSkillLookup[normalizeSkillKey(skill.label)],
  );
}

export function useFarmSkillState({
  playerData,
  farmLevel,
  skills,
}: {
  playerData: PlayerData | null;
  farmLevel: number;
  skills: SkillBoost[];
}): {
  farmSkillState: FarmSkillState;
  ownedSkills: Record<string, boolean>;
  skills: SkillBoost[];
} {
  return useMemo(() => {
    const ownedSkillLookup = getOwnedSkillLookup(playerData?.bumpkin?.skills);
    const skillsWithOwnership = ownedSkillLookup
      ? skills.map((skill) => ({
          ...skill,
          owned: isSkillOwnedByFarm(skill, ownedSkillLookup),
        }))
      : skills;

    const ownedSkills = skillsWithOwnership.reduce<Record<string, boolean>>(
      (lookup, skill) => {
        if (skill.owned) {
          lookup[skill.id] = true;
        }
        return lookup;
      },
      {},
    );

    return {
      farmSkillState: {
        farmLevel,
        skillPointsTotal: getTotalSkillPoints(farmLevel),
        skillPointsSpent: getSkillPointsSpent(skillsWithOwnership),
      },
      ownedSkills,
      skills: skillsWithOwnership,
    };
  }, [farmLevel, playerData?.bumpkin?.skills, skills]);
}
