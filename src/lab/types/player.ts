// SFL-Lab – Portal-Player-Typen (vereinfacht, unabhängig von GameState)

export interface Bumpkin {
  experience: number;
  equipped?: Record<string, string>;
  skills?: Record<string, number | boolean>;
}

export interface PlayerData {
  farmId: number;
  bumpkin?: Bumpkin;
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
