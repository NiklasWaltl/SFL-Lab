import type { CropConfig } from "../types";

// seedCostFlw: FLW pro 1 Seed (nicht Coins).
// Referenz: Game-Ingame-Seed-Shop-Preis in Coins ÷ aktuellem Coin/FLW-Kurs.
// harvestMinutes: Vanilla-Wachstumszeit ohne Boosts.
// Boosts (Skills, NFTs) werden zur Laufzeit in getBoostedCropInputs() angewendet.
// TODO: Seed-FLW-Preise außer Wheat mit echten Game-Werten ersetzen.
export const CROP_CONFIGS = [
  {
    name: "Sunflower",
    label: "Sunflower",
    marketKey: "Sunflower",
    seedCostFlw: 0,
    harvestMinutes: 1,
  },
  {
    name: "Potato",
    label: "Potato",
    marketKey: "Potato",
    seedCostFlw: 0,
    harvestMinutes: 5,
  },
  {
    name: "Pumpkin",
    label: "Pumpkin",
    marketKey: "Pumpkin",
    seedCostFlw: 0,
    harvestMinutes: 60,
  },
  {
    name: "Carrot",
    label: "Carrot",
    marketKey: "Carrot",
    seedCostFlw: 0,
    harvestMinutes: 120,
  },
  {
    name: "Cabbage",
    label: "Cabbage",
    marketKey: "Cabbage",
    seedCostFlw: 0,
    harvestMinutes: 240,
  },
  {
    name: "Soybean",
    label: "Soybean",
    marketKey: "Soybean",
    seedCostFlw: 0,
    harvestMinutes: 360,
  },
  {
    name: "Beetroot",
    label: "Beetroot",
    marketKey: "Beetroot",
    seedCostFlw: 0,
    harvestMinutes: 480,
  },
  {
    name: "Cauliflower",
    label: "Cauliflower",
    marketKey: "Cauliflower",
    seedCostFlw: 0,
    harvestMinutes: 720,
  },
  {
    name: "Parsnip",
    label: "Parsnip",
    marketKey: "Parsnip",
    seedCostFlw: 0,
    harvestMinutes: 660,
  },
  {
    name: "Eggplant",
    label: "Eggplant",
    marketKey: "Eggplant",
    seedCostFlw: 0,
    harvestMinutes: 720,
  },
  {
    name: "Corn",
    label: "Corn",
    marketKey: "Corn",
    seedCostFlw: 0,
    harvestMinutes: 960,
  },
  {
    name: "Radish",
    label: "Radish",
    marketKey: "Radish",
    seedCostFlw: 0,
    harvestMinutes: 1440,
  },
  {
    name: "Wheat",
    label: "Wheat",
    marketKey: "Wheat",
    seedCostFlw: 0.0096,
    harvestMinutes: 1108,
  },
  {
    name: "Kale",
    label: "Kale",
    marketKey: "Kale",
    seedCostFlw: 0,
    harvestMinutes: 1440,
  },
  {
    name: "Barley",
    label: "Barley",
    marketKey: "Barley",
    seedCostFlw: 0,
    harvestMinutes: 1200,
  },
  {
    name: "Rhubarb",
    label: "Rhubarb",
    marketKey: "Rhubarb",
    seedCostFlw: 0,
    harvestMinutes: 1440,
  },
  {
    name: "Zucchini",
    label: "Zucchini",
    marketKey: "Zucchini",
    seedCostFlw: 0,
    harvestMinutes: 960,
  },
  {
    name: "Yam",
    label: "Yam",
    marketKey: "Yam",
    seedCostFlw: 0,
    harvestMinutes: 720,
  },
  {
    name: "Broccoli",
    label: "Broccoli",
    marketKey: "Broccoli",
    seedCostFlw: 0,
    harvestMinutes: 480,
  },
  {
    name: "Pepper",
    label: "Pepper",
    marketKey: "Pepper",
    seedCostFlw: 0,
    harvestMinutes: 360,
  },
  {
    name: "Onion",
    label: "Onion",
    marketKey: "Onion",
    seedCostFlw: 0,
    harvestMinutes: 240,
  },
  {
    name: "Turnip",
    label: "Turnip",
    marketKey: "Turnip",
    seedCostFlw: 0,
    harvestMinutes: 120,
  },
  {
    name: "Artichoke",
    label: "Artichoke",
    marketKey: "Artichoke",
    seedCostFlw: 0,
    harvestMinutes: 1440,
  },
] as const satisfies readonly CropConfig[];

export const CROP_BY_NAME = Object.fromEntries(
  CROP_CONFIGS.map((crop) => [crop.name, crop]),
) as Record<CropConfig["name"], CropConfig>;
