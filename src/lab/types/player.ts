// SFL-Lab – Portal-Player-Typen (vereinfacht, unabhängig von GameState)

export interface PlayerData {
  farmId: number;
  bumpkin?: {
    experience: number;
    equipped?: Record<string, string>;
  };
  inventory: Record<string, string>;
  buildings?: Record<string, unknown[]>;
  collectibles?: Record<string, unknown[]>;
}

export interface NormalizedFarm {
  farmId: number;
  woodBalance: number;
  stoneBalance: number;
  coinBalance: number;
  flowerBalance: number;
  level: number;
  collectibles: string[];
  buildings: string[];
}
