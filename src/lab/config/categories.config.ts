// SFL-Lab – Gewinnbereich-Kategorien (Reihenfolge & Metadaten)
// Neue Kategorien hier ergänzen – keine Komponente muss geändert werden

import type { Category, CategoryKey } from "../types";

export type { Category } from "../types";

export const CATEGORIES = [
  {
    key: "resources",
    label: "Ressourcen",
    description: "P2P-Gewinn aus Wood und Stone (FLW/Tag)",
    defaultStatus: "calculated",
  },
  {
    key: "crops",
    label: "Crops",
    description: "Datenbasis für Ernten folgt in einer späteren Version",
    defaultStatus: "placeholder",
  },
  {
    key: "animals",
    label: "Tiere",
    description: "Datenbasis für Tiere folgt in einer späteren Version",
    defaultStatus: "placeholder",
  },
  {
    key: "crafting",
    label: "Crafting",
    description: "Datenbasis für Crafting folgt in einer späteren Version",
    defaultStatus: "placeholder",
  },
  {
    key: "trading",
    label: "Trading",
    description: "Datenbasis für Trading folgt in einer späteren Version",
    defaultStatus: "placeholder",
  },
  {
    key: "boosts",
    label: "Boosts & NFTs",
    description:
      "Marginaler Gewinnbeitrag pro Boost (Attribution, nicht additiv zum Netto)",
    defaultStatus: "partial",
  },
  {
    key: "costs",
    label: "Kosten",
    description: "Gesamtkosten in FLW/Tag (Tools, umgerechnete Coins)",
    defaultStatus: "calculated",
  },
  {
    key: "net",
    label: "Netto",
    description: "Gesamtgewinn P2P über alle berechneten Ressourcen",
    defaultStatus: "calculated",
  },
] as const satisfies readonly Category[];

export const CATEGORY_BY_KEY = Object.fromEntries(
  CATEGORIES.map((category) => [category.key, category]),
) as Record<CategoryKey, Category>;
