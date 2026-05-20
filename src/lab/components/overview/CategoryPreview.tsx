import React from "react";
import type { OverviewKpis } from "../../utils/overviewKpis";
import { formatNumber } from "../../utils/format";

interface CategoryPreviewProps {
  kpis: OverviewKpis;
  ownedBoostCount: number;
  experimentBoostCount: number;
}

interface CategoryTile {
  name: string;
  status: "active" | "partial" | "placeholder";
  detail?: string;
}

export function CategoryPreview({
  kpis,
  ownedBoostCount,
  experimentBoostCount,
}: CategoryPreviewProps) {
  const categories: CategoryTile[] = [
    {
      name: "Ressourcen",
      status: "active",
      detail: `Wood ${formatNumber(kpis.woodProfitPerDay)} / Stone ${formatNumber(kpis.stoneProfitPerDay)} FLW/Tag`,
    },
    {
      name: "Crops",
      status: "partial",
      detail: "Plot-basierte Teilberechnung im Kategorien-Tab",
    },
    { name: "Tiere", status: "placeholder" },
    { name: "Crafting", status: "placeholder" },
    { name: "Trading", status: "placeholder" },
    {
      name: "Boosts & NFTs",
      status: "active",
      detail: `${ownedBoostCount} owned · ${experimentBoostCount} experiment`,
    },
    {
      name: "Kosten",
      status: "active",
      detail: `${formatNumber(kpis.totalCostsPerDay)} FLW/Tag`,
    },
  ];

  return (
    <section className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-[#ead4aa]">
        {"Kategorien"}
      </h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((cat) => (
          <li
            key={cat.name}
            className={`rounded-lg border p-4 ${
              cat.status === "placeholder"
                ? "border-[#3e2731]/30 opacity-60"
                : "border-[#3e2731]/50"
            }`}
          >
            <p className="font-medium text-[#ead4aa]">{cat.name}</p>
            {cat.status === "placeholder" ? (
              <>
                <p className="mt-2 text-sm text-gray-500">{"Bald verfügbar"}</p>
                <span className="mt-2 inline-block rounded bg-[#3e2731]/40 px-2 py-0.5 text-xs text-gray-400">
                  {"Platzhalter"}
                </span>
              </>
            ) : cat.status === "partial" ? (
              <>
                <p className="mt-2 text-sm text-gray-300">{cat.detail}</p>
                <span className="mt-2 inline-block rounded bg-amber-500/20 px-2 py-0.5 text-xs text-amber-300">
                  {"Teilweise"}
                </span>
              </>
            ) : (
              <p className="mt-2 text-sm text-gray-300">{cat.detail}</p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
