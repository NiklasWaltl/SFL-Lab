// SFL-Lab – Portfolio-Tab
// Zeigt eigene NFTs/Boosts als Portfolio-Positionen mit wirtschaftlicher Analyse
import React, { useCallback, useMemo, useState } from "react";
import type { useScenarioPersistence } from "../hooks/useScenarioPersistence";
import type {
  Boost,
  GlobalParams,
  ResourceConfig,
  ResourceResult,
} from "../types";
import type { ScenarioPortfolioData } from "../types/scenario";
import { buildPortfolioPositions } from "../utils/portfolioCalc";
import type { PortfolioPosition } from "../types/portfolio";

interface PortfolioTabProps {
  boosts: Boost[];
  resources: ResourceConfig[];
  globalParams: GlobalParams;
  actualActiveBoosts: Boost[];
  actualResults: ResourceResult[];
  loading: boolean;
  isMock: boolean;
  error: string | null;
  scenarioPersistence: ReturnType<typeof useScenarioPersistence>;
}

function flw(v: number | null, decimals = 2): string {
  if (v === null) return "—";
  return v.toFixed(decimals) + " FLW";
}

function fmtDays(v: number | null): string {
  if (v === null) return "—";
  if (v >= 365) return Math.round(v / 365) + " J";
  if (v >= 30) return Math.round(v / 30) + " Mon";
  return v + " Tage";
}

function RoiBadge({ roi }: { roi: number | null }) {
  if (roi === null) return <span className="text-gray-500 text-xs">{"—"}</span>;
  const positive = roi >= 0;
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-xs font-semibold ${
        positive
          ? "bg-green-900/60 text-green-300"
          : "bg-red-900/60 text-red-300"
      }`}
    >
      {positive ? "+" : ""}
      {roi.toFixed(1)}
      {"%"}
    </span>
  );
}

function BreakEvenBar({
  breakEvenDays,
  daysSince,
}: {
  breakEvenDays: number | null;
  daysSince: number | null;
}) {
  if (!breakEvenDays || daysSince === null) return null;
  const progress = Math.min(100, (daysSince / breakEvenDays) * 100);
  const reached = daysSince >= breakEvenDays;
  return (
    <div className="mt-1.5">
      <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
        <span>{"Break-even Fortschritt"}</span>
        <span>
          {daysSince}
          {" / "}
          {breakEvenDays}
          {" Tage"}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-gray-700">
        <div
          className={`h-1.5 rounded-full transition-all ${
            reached ? "bg-green-400" : "bg-amber-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function PositionCard({
  pos,
  onSetDate,
  onSetCurrentValue,
  purchaseDateInput,
  currentValueInput,
}: {
  pos: PortfolioPosition;
  onSetDate: (id: string, val: string) => void;
  onSetCurrentValue: (id: string, val: string) => void;
  purchaseDateInput: string;
  currentValueInput: string;
}) {
  const worthIt = pos.breakEvenDays !== null && pos.breakEvenDays <= 365;

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${
        pos.owned
          ? "border-[#3e2731]/70 bg-[#181425]"
          : "border-amber-700/30 bg-[#12101f]"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#ead4aa]">{pos.label}</span>
            {pos.source === "nft" && (
              <span className="rounded bg-amber-700/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-300">
                {"NFT"}
              </span>
            )}
            {pos.source === "skill" && (
              <span className="rounded bg-blue-900/40 px-1.5 py-0.5 text-[10px] font-medium text-blue-300">
                {"Skill"}
              </span>
            )}
            {!pos.owned && (
              <span className="rounded bg-gray-700/60 px-1.5 py-0.5 text-[10px] text-gray-400">
                {"nicht owned"}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {"Ressource: "}
            {pos.affectsResource}
          </p>
        </div>
        {pos.breakEvenDays !== null && (
          <span
            className={`text-xs rounded px-2 py-1 font-medium ${
              worthIt
                ? "bg-green-900/40 text-green-300"
                : "bg-yellow-900/30 text-yellow-400"
            }`}
          >
            {worthIt ? "✓ lohnt sich" : "⚠ langer Horizont"}
          </span>
        )}
      </div>

      {/* Kennzahlen-Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
        <Metric label="Kaufpreis" value={flw(pos.purchasePriceFlw)} sub="FLW" />
        <Metric label="Akt. Wert" value={flw(pos.currentValueFlw)} sub="FLW" />
        <Metric
          label="+Wert / Tag"
          value={flw(pos.dailyValueFlw, 4)}
          highlight={pos.dailyValueFlw > 0}
        />
        <Metric
          label="Break-even"
          value={fmtDays(pos.breakEvenDays)}
          sub={pos.breakEvenDays ? "Tage bis Amortisation" : undefined}
        />
      </div>

      {/* ROI + Earned */}
      <div className="flex flex-wrap items-center gap-3 text-xs mb-3">
        <span className="text-gray-400">
          {"ROI: "}
          <RoiBadge roi={pos.roiPercent} />
        </span>
        {pos.earnedSoPurchaseFlw !== null && (
          <span className="text-gray-400">
            {"Bereits erwirtschaftet:"}{" "}
            <span className="text-green-300 font-medium">
              {pos.earnedSoPurchaseFlw.toFixed(2)}
              {" FLW"}
            </span>
            {pos.purchasePriceFlw && (
              <span className="text-gray-600">
                {" /"}
                {pos.purchasePriceFlw.toFixed(2)}
                {" FLW"}
              </span>
            )}
          </span>
        )}
      </div>

      {/* Break-even Fortschrittsbalken */}
      <BreakEvenBar
        breakEvenDays={pos.breakEvenDays}
        daysSince={pos.daysSincePurchase}
      />

      {/* Editierbare Inputs */}
      <div className="mt-3 flex flex-wrap gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">{"Kaufdatum"}</span>
          <input
            type="date"
            value={purchaseDateInput}
            onChange={(e) => onSetDate(pos.id, e.target.value)}
            className="rounded bg-[#0f0d1a] border border-[#3e2731]/50 text-[#ead4aa] px-2 py-1 text-xs"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-500">
            {"Akt. Marktwert (FLW)"}
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder={pos.purchasePriceFlw?.toString() ?? "—"}
            value={currentValueInput}
            onChange={(e) => onSetCurrentValue(pos.id, e.target.value)}
            className="w-28 rounded bg-[#0f0d1a] border border-[#3e2731]/50 text-[#ead4aa] px-2 py-1 text-xs"
          />
        </label>
      </div>
    </div>
  );
}

function Metric({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-lg bg-[#0f0d1a]/80 px-3 py-2">
      <p className="text-[10px] text-gray-500 mb-0.5">{label}</p>
      <p
        className={`text-sm font-semibold ${
          highlight ? "text-green-300" : "text-[#ead4aa]"
        }`}
      >
        {value}
      </p>
      {sub && <p className="text-[9px] text-gray-600 mt-0.5">{sub}</p>}
    </div>
  );
}

export function PortfolioTab({
  boosts,
  resources,
  globalParams,
  actualActiveBoosts,
  loading,
  isMock,
  error,
  scenarioPersistence,
}: PortfolioTabProps) {
  const { scenarios, activeScenarioId, saveScenario } = scenarioPersistence;

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === activeScenarioId) ?? scenarios[0],
    [scenarios, activeScenarioId],
  );

  const purchaseDates = useMemo(
    () => activeScenario?.data.portfolio.purchaseDates ?? {},
    [activeScenario],
  );

  const currentValues = useMemo(
    () => activeScenario?.data.portfolio.currentValues ?? {},
    [activeScenario],
  );

  const [filter, setFilter] = useState<"all" | "owned" | "nft" | "skill">(
    "all",
  );

  const patchPortfolio = useCallback(
    (patch: Partial<ScenarioPortfolioData>) => {
      if (!activeScenario) return;
      saveScenario({
        ...activeScenario,
        data: {
          ...activeScenario.data,
          portfolio: { ...activeScenario.data.portfolio, ...patch },
        },
        updatedAt: new Date().toISOString(),
      });
    },
    [activeScenario, saveScenario],
  );

  const currentValuesNum = useMemo(() => {
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(currentValues)) {
      const n = parseFloat(v);
      if (!isNaN(n)) out[k] = n;
    }
    return out;
  }, [currentValues]);

  const positions = useMemo(
    () =>
      buildPortfolioPositions(
        boosts,
        resources,
        globalParams,
        actualActiveBoosts,
        purchaseDates,
        currentValuesNum,
      ),
    [
      boosts,
      resources,
      globalParams,
      actualActiveBoosts,
      purchaseDates,
      currentValuesNum,
    ],
  );

  const filtered = useMemo(() => {
    if (filter === "owned") return positions.filter((p) => p.owned);
    if (filter === "nft") return positions.filter((p) => p.source === "nft");
    if (filter === "skill")
      return positions.filter((p) => p.source === "skill");
    return positions;
  }, [positions, filter]);

  const totalDailyFlw = positions
    .filter((p) => p.owned)
    .reduce((s, p) => s + p.dailyValueFlw, 0);

  const totalEarned = positions
    .filter((p) => p.owned && p.earnedSoPurchaseFlw !== null)
    .reduce((s, p) => s + (p.earnedSoPurchaseFlw ?? 0), 0);

  const handleSetDate = (id: string, val: string) =>
    patchPortfolio({
      purchaseDates: { ...purchaseDates, [id]: val },
    });

  const handleSetCurrentValue = (id: string, val: string) =>
    patchPortfolio({
      currentValues: { ...currentValues, [id]: val },
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-gray-400">
        {"Lade Farm-Daten…"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mock-Banner */}
      {isMock && (
        <div className="rounded-lg border border-amber-600/40 bg-amber-900/20 px-4 py-2 text-sm text-amber-300">
          {"⚠ Beispiel-Daten (keine echte Farm verbunden)"}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-600/40 bg-red-900/20 px-4 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Zusammenfassung */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Owned Boosts"
          value={String(positions.filter((p) => p.owned).length)}
        />
        <SummaryCard
          label="Täglicher Mehrwert"
          value={totalDailyFlw.toFixed(4) + " FLW"}
          highlight
        />
        <SummaryCard
          label="Gesamt erwirtschaftet"
          value={totalEarned > 0 ? totalEarned.toFixed(2) + " FLW" : "—"}
        />
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {(["all", "owned", "nft", "skill"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-amber-700/70 text-amber-100"
                : "bg-[#1a1730] text-gray-400 hover:text-[#ead4aa]"
            }`}
          >
            {f === "all"
              ? "Alle"
              : f === "owned"
                ? "Besitz"
                : f === "nft"
                  ? "NFTs"
                  : "Skills"}
          </button>
        ))}
      </div>

      {/* Karten-Liste */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {"Keine Einträge für diesen Filter."}
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((pos) => (
            <PositionCard
              key={pos.id}
              pos={pos}
              onSetDate={handleSetDate}
              onSetCurrentValue={handleSetCurrentValue}
              purchaseDateInput={purchaseDates[pos.id] ?? ""}
              currentValueInput={currentValues[pos.id] ?? ""}
            />
          ))}
        </div>
      )}

      <p className="text-[11px] text-gray-600">
        {
          "* Täglicher Mehrwert = marginaler P2P-Profit durch diesen Boost allein. Break-even basiert auf Kaufpreis ÷ täglichem Mehrwert."
        }
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-[#3e2731]/50 bg-[#181425] px-4 py-3">
      <p className="text-[11px] text-gray-500 mb-1">{label}</p>
      <p
        className={`text-lg font-bold ${highlight ? "text-green-300" : "text-[#ead4aa]"}`}
      >
        {value}
      </p>
    </div>
  );
}
