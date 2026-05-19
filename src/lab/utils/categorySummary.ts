import type { CategoryKey, CategoryValue } from "../types/categories";

const RANKING_KEYS: CategoryKey[] = [
  "resources",
  "crops",
  "animals",
  "crafting",
  "trading",
  "boosts",
];

export function getCategorySummary(categories: CategoryValue[]): {
  strongest: CategoryValue | null;
  weakest: CategoryValue | null;
  totalDelta: number;
} {
  const net = categories.find((c) => c.key === "net");
  const totalDelta = net?.delta ?? 0;

  const rankable = categories.filter(
    (c) => RANKING_KEYS.includes(c.key) && c.status !== "placeholder",
  );

  if (rankable.length === 0) {
    return { strongest: null, weakest: null, totalDelta };
  }

  const strongest = rankable.reduce((best, c) =>
    c.actual > best.actual ? c : best,
  );
  const weakest = rankable.reduce((worst, c) =>
    c.actual < worst.actual ? c : worst,
  );

  return { strongest, weakest, totalDelta };
}
