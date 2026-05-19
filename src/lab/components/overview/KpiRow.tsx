import React from "react";
import type { NormalizedFarm } from "../../types/player";
import type { OverviewKpis } from "../../utils/overviewKpis";
import { KpiCard } from "./KpiCard";

interface KpiRowProps {
  farm: NormalizedFarm | null;
  kpis: OverviewKpis;
  ownedBoostCount: number;
  experimentBoostCount: number;
}

function formatFarmId(farmId: number): string {
  const id = String(farmId);
  if (id.length <= 8) return id;
  return `…${id.slice(-6)}`;
}

export function KpiRow({
  farm,
  kpis,
  ownedBoostCount,
  experimentBoostCount,
}: KpiRowProps) {
  const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5";

  return (
    <section className="flex flex-col gap-4">
      <section className={gridClass}>
        <KpiCard
          label="Gesamtumsatz / Tag"
          value={kpis.totalRevenuePerDay}
          unit="FLW"
        />
        <KpiCard
          label="Gesamtkosten / Tag"
          value={kpis.totalCostsPerDay}
          unit="FLW"
        />
        <KpiCard
          label="Gesamtgewinn / Tag"
          value={kpis.totalProfitPerDay}
          unit="FLW"
        />
        <KpiCard
          label="Simulierter Gewinn / Tag"
          value={kpis.simulatedProfitPerDay}
          unit="FLW"
        />
        <KpiCard
          label="Delta durch aktive NFTs"
          value={kpis.nftProfitDelta}
          unit="FLW/Tag"
          delta={kpis.nftProfitDelta}
          deltaLabel="Δ"
        />
      </section>

      <section className={gridClass}>
        <KpiCard label="Aktuell Wood" value={farm?.woodBalance ?? 0} />
        <KpiCard label="Aktuell Stone" value={farm?.stoneBalance ?? 0} />
        <KpiCard label="Aktive Boosts" value={ownedBoostCount} />
        <KpiCard label="Experiment-Boosts" value={experimentBoostCount} />
        <KpiCard
          label="Farm ID"
          value={farm ? formatFarmId(farm.farmId) : "—"}
          title={farm ? String(farm.farmId) : undefined}
        />
      </section>
    </section>
  );
}
