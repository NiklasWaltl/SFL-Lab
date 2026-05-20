import React from "react";
import type { LabMode } from "../../hooks/useLabState";
import type { NormalizedFarm } from "../../types";
import type { OverviewKpis } from "../../utils/overviewKpis";
import { KpiCard } from "./KpiCard";

interface KpiRowProps {
  farm: NormalizedFarm | null;
  kpis: OverviewKpis;
  mode: LabMode;
  ownedBoostCount: number;
  experimentBoostCount: number;
  pricesAreLive?: boolean;
  pricesLastUpdated?: string;
}

function formatFarmId(farmId: number): string {
  const id = String(farmId);
  if (id.length <= 8) return id;
  return `…${id.slice(-6)}`;
}

function getPriceStatusLabel(
  pricesAreLive?: boolean,
  pricesLastUpdated?: string,
): string {
  if (pricesAreLive === true) return "🟢 Live-Preise";
  if (pricesAreLive === false && pricesLastUpdated) return "🟡 Fallback-Preise";
  return "🔵 Standard-Preise";
}

export function KpiRow({
  farm,
  kpis,
  mode,
  ownedBoostCount,
  experimentBoostCount,
  pricesAreLive,
  pricesLastUpdated,
}: KpiRowProps) {
  const isExperimentView = mode === "experiment";
  const gridClass = "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5";
  const priceStatusLabel = getPriceStatusLabel(
    pricesAreLive,
    pricesLastUpdated,
  );

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
        {isExperimentView && (
          <KpiCard
            label="Simulierter Gewinn / Tag"
            value={kpis.simulatedProfitPerDay}
            unit="FLW"
          />
        )}
        {isExperimentView && (
          <KpiCard
            label="Delta Produktion durch aktive NFTs"
            value={kpis.nftProductionDelta}
            unit="/Tag"
            delta={kpis.nftProductionDelta}
            deltaLabel="Δ"
          />
        )}
        {isExperimentView && (
          <KpiCard
            label="Delta durch aktive NFTs"
            value={kpis.nftProfitDelta}
            unit="FLW/Tag"
            delta={kpis.nftProfitDelta}
            deltaLabel="Δ"
          />
        )}
      </section>
      <p className="text-xs text-gray-400">{priceStatusLabel}</p>

      <section className={gridClass}>
        <KpiCard label="Aktuell Wood" value={farm ? farm.woodBalance : "—"} />
        <KpiCard label="Aktuell Stone" value={farm ? farm.stoneBalance : "—"} />
        {farm?.balance !== undefined && (
          <KpiCard label="SFL" value={farm.balance} />
        )}
        {farm?.coins !== undefined && (
          <KpiCard label="Coins" value={farm.coins.toLocaleString("de-DE")} />
        )}
        <KpiCard label="Aktive Boosts" value={ownedBoostCount} />
        <KpiCard label="Experiment-Boosts" value={experimentBoostCount} />
        <KpiCard
          label="Farm ID"
          value={farm ? formatFarmId(farm.farmId) : "—"}
          title={farm ? String(farm.farmId) : undefined}
        />
      </section>
      {!farm && (
        <p className="text-xs text-amber-300/80">{"Keine Farm-Verbindung"}</p>
      )}
    </section>
  );
}
