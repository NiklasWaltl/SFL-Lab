import { useMemo } from "react";
import type { FarmSkillState, PlayerData, SkillBoost } from "../types";
import {
  getSkillPointsSpent,
  getTotalSkillPoints,
  isBoostOwned,
} from "../utils/boosts";

export function useFarmSkillState({
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
    const ownedSkills = skills.reduce<Record<string, boolean>>(
      (lookup, skill) => {
        if (isBoostOwned(skill)) {
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
        skillPointsSpent: getSkillPointsSpent(skills),
      },
      ownedSkills,
      skills,
    };
  }, [farmLevel, skills]);
}
