import { getBuildingNames, getCollectibleNames } from "../services/playerApi";
import type { NormalizedFarm, PlayerData } from "../types/player";
import { getBumpkinLevel } from "./bumpkinLevel";

function parseBalance(inventory: Record<string, string>, key: string): number {
  const raw = inventory[key];
  if (raw === undefined) return 0;
  return parseFloat(raw) || 0;
}

export function normalizeFarm(data: PlayerData): NormalizedFarm {
  return {
    farmId: data.farmId,
    woodBalance: parseBalance(data.inventory, "Wood"),
    stoneBalance: parseBalance(data.inventory, "Stone"),
    coinBalance: parseBalance(data.inventory, "Coin"),
    flowerBalance: parseBalance(data.inventory, "Flower"),
    level: getBumpkinLevel(data.bumpkin?.experience ?? 0),
    collectibles: getCollectibleNames(data),
    buildings: getBuildingNames(data),
  };
}
