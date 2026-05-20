import type { CropConfig } from "../types";

// seedCostCoins: offizieller Seed-Shop-Preis in Coins.
// Quelle: sunflower-land/src/features/game/types/crops.ts (CROP_SEEDS[x].price).
// FLW-Umrechnung: seedCostCoins / coinToFlowerRatio zur Laufzeit.
// harvestMinutes: Vanilla-Wachstumszeit ohne Boosts.
// Boosts (Skills, NFTs) werden zur Laufzeit in getBoostedCropInputs() angewendet.
export const CROP_CONFIGS = [
  {
    name: "Sunflower",
    label: "Sunflower",
    marketKey: "Sunflower",
    seedCostCoins: 0.01,
    harvestMinutes: 1,
  },
  {
    name: "Potato",
    label: "Potato",
    marketKey: "Potato",
    seedCostCoins: 0.1,
    harvestMinutes: 5,
  },
  {
    name: "Pumpkin",
    label: "Pumpkin",
    marketKey: "Pumpkin",
    seedCostCoins: 0.2,
    harvestMinutes: 60,
  },
  {
    name: "Carrot",
    label: "Carrot",
    marketKey: "Carrot",
    seedCostCoins: 0.5,
    harvestMinutes: 120,
  },
  {
    name: "Cabbage",
    label: "Cabbage",
    marketKey: "Cabbage",
    seedCostCoins: 1,
    harvestMinutes: 240,
  },
  {
    name: "Soybean",
    label: "Soybean",
    marketKey: "Soybean",
    seedCostCoins: 1.5,
    harvestMinutes: 360,
  },
  {
    name: "Beetroot",
    label: "Beetroot",
    marketKey: "Beetroot",
    seedCostCoins: 2,
    harvestMinutes: 480,
  },
  {
    name: "Cauliflower",
    label: "Cauliflower",
    marketKey: "Cauliflower",
    seedCostCoins: 3,
    harvestMinutes: 720,
  },
  {
    name: "Parsnip",
    label: "Parsnip",
    marketKey: "Parsnip",
    seedCostCoins: 5,
    harvestMinutes: 660,
  },
  {
    name: "Eggplant",
    label: "Eggplant",
    marketKey: "Eggplant",
    seedCostCoins: 6,
    harvestMinutes: 720,
  },
  {
    name: "Corn",
    label: "Corn",
    marketKey: "Corn",
    seedCostCoins: 7,
    harvestMinutes: 960,
  },
  {
    name: "Radish",
    label: "Radish",
    marketKey: "Radish",
    seedCostCoins: 7,
    harvestMinutes: 1440,
  },
  {
    name: "Wheat",
    label: "Wheat",
    marketKey: "Wheat",
    seedCostCoins: 5,
    harvestMinutes: 1108,
  },
  {
    name: "Kale",
    label: "Kale",
    marketKey: "Kale",
    seedCostCoins: 7,
    harvestMinutes: 1440,
  },
  {
    name: "Barley",
    label: "Barley",
    marketKey: "Barley",
    seedCostCoins: 10,
    harvestMinutes: 1200,
  },
  {
    name: "Rhubarb",
    label: "Rhubarb",
    marketKey: "Rhubarb",
    seedCostCoins: 0.15,
    harvestMinutes: 1440,
  },
  {
    name: "Zucchini",
    label: "Zucchini",
    marketKey: "Zucchini",
    seedCostCoins: 0.2,
    harvestMinutes: 960,
  },
  {
    name: "Yam",
    label: "Yam",
    marketKey: "Yam",
    seedCostCoins: 0.5,
    harvestMinutes: 720,
  },
  {
    name: "Broccoli",
    label: "Broccoli",
    marketKey: "Broccoli",
    seedCostCoins: 1,
    harvestMinutes: 480,
  },
  {
    name: "Pepper",
    label: "Pepper",
    marketKey: "Pepper",
    seedCostCoins: 2,
    harvestMinutes: 360,
  },
  {
    name: "Onion",
    label: "Onion",
    marketKey: "Onion",
    seedCostCoins: 7,
    harvestMinutes: 240,
  },
  {
    name: "Turnip",
    label: "Turnip",
    marketKey: "Turnip",
    seedCostCoins: 5,
    harvestMinutes: 120,
  },
  {
    name: "Artichoke",
    label: "Artichoke",
    marketKey: "Artichoke",
    seedCostCoins: 7,
    harvestMinutes: 1440,
  },
] as const satisfies readonly CropConfig[];

export const CROP_BY_NAME = Object.fromEntries(
  CROP_CONFIGS.map((crop) => [crop.name, crop]),
) as Record<CropConfig["name"], CropConfig>;
