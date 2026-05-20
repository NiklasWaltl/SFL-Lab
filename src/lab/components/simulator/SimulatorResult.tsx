import React, { useMemo } from "react";
import type { Boost, CategoryValue, SimulatorImpact } from "../../types";
import { CATEGORY_BY_KEY } from "../../config/categories.config";
import { deltaColorClass, formatDelta, formatNumber } from "../../utils/format";
import { getBoostAffectedCategoryKeys } from "../../utils/simulator";

export interface SimulatorResultProps {
  impact: SimulatorImpact;
  selectedBoost: Boost | null;
  categoryBreakdown: CategoryValue[];
  enabled: boolean;
}

function getInsightMessage(
  impact: SimulatorImpact,
  selectedBoost: Boost | null,
  enabled: boolean,
): string | null {
  if (!selectedBoost || !enabled) return null;

  if (selectedBoost.owned) {
    return "Dieser Boost ist bereits auf deiner Farm aktiv – kein zusätzlicher Effekt.";
  }

  if (impact.totalDelta <= 0.01) {
    return "Dieses NFT lohnt sich für deine aktuelle Farm kaum.";
  }

  const { keys } = getBoostAffectedCategoryKeys(selectedBoost);
  const labels = keys
    .map((k) => CATEGORY_BY_KEY[k]?.label ?? k)
    .filter((l) => l !== "Netto");

  if (labels.length > 0) {
    return `Dieses NFT bringt vor allem bei ${labels.join(" / ")} etwas.`;
  }

  return "Positiver Effekt auf deinen Farm-Gewinn erwartet.";
}

export function SimulatorResult({
  impact,
  selectedBoost,
  categoryBreakdown,
  enabled,
}: SimulatorResultProps) {
  const insight = useMemo(
    () => getInsightMessage(impact, selectedBoost, enabled),
    [impact, selectedBoost, enabled],
  );

  const affectedCategories = useMemo(() => {
    const entries = Object.entries(impact.categoryDeltas).filter(
      ([key, delta]) => key !== "net" && Math.abs(delta) > 0.0001,
    );

    if (entries.length > 0) {
      return entries.map(([key, delta]) => {
        const meta = CATEGORY_BY_KEY[key as CategoryValue["key"]];
        const fromList = categoryBreakdown.find((c) => c.key === key);
        const estimated = impact.estimatedCategoryKeys?.includes(
          key as CategoryValue["key"],
        );
        return {
          key,
          label: meta?.label ?? fromList?.label ?? key,
          delta,
          estimated,
          status: fromList?.status,
        };
      });
    }

    if (!selectedBoost || !enabled) return [];

    const { keys } = getBoostAffectedCategoryKeys(selectedBoost);
    return keys
      .filter((k) => k !== "net")
      .map((key) => ({
        key,
        label: CATEGORY_BY_KEY[key].label,
        delta: impact.totalDelta,
        estimated: true,
        status: categoryBreakdown.find((c) => c.key === key)?.status,
      }));
  }, [impact, categoryBreakdown, selectedBoost, enabled]);

  const showEconomics =
    enabled &&
    selectedBoost &&
    impact.totalDelta > 0 &&
    (impact.breakEvenDays !== null || impact.roiPercent !== undefined);

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <div>
        <h2 className="text-lg font-semibold text-[#ead4aa]">{"Auswirkung"}</h2>
        <p className="mt-1 text-xs text-gray-400">
          {"Delta gegenüber Ist-Zustand (nur dieser simulierte Boost)"}
        </p>
      </div>

      {!selectedBoost && (
        <p className="rounded-lg border border-dashed border-[#3e2731]/50 bg-[#0f0d1a] px-4 py-8 text-center text-sm text-gray-500">
          {"Wähle links einen Boost, um die Auswirkung zu sehen."}
        </p>
      )}

      {selectedBoost && (
        <>
          <div className="rounded-xl border border-[#3e2731]/50 bg-[#0f0d1a] p-4 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {"Gesamt-Delta pro Tag"}
            </p>
            <p
              className={`mt-2 text-3xl font-bold sm:text-4xl ${deltaColorClass(
                enabled ? impact.totalDelta : 0,
              )}`}
            >
              {enabled ? formatDelta(impact.totalDelta) : formatDelta(0)}
            </p>
            <p className="mt-1 text-sm text-gray-500">{"FLW/Tag"}</p>
            {selectedBoost && (
              <p className="mt-2 text-xs text-gray-400">
                {selectedBoost.label}
                {!enabled && " · Simulation aus"}
              </p>
            )}
          </div>

          {insight && (
            <p
              className={`rounded-lg px-3 py-2 text-sm ${
                impact.totalDelta > 0.01 && !selectedBoost.owned
                  ? "border border-green-500/30 bg-green-500/10 text-green-200"
                  : "border border-[#3e2731]/50 bg-[#0f0d1a] text-gray-300"
              }`}
              role="status"
            >
              {insight}
            </p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label="Break-even"
              value={
                !enabled || !selectedBoost
                  ? "—"
                  : impact.breakEvenDays !== null &&
                      impact.breakEvenDays !== undefined
                    ? `${impact.breakEvenDays} Tage`
                    : "Nicht berechenbar"
              }
              highlight
            />
            <MetricCard
              label="ROI (annualisiert)"
              value={
                !enabled || !selectedBoost
                  ? "—"
                  : impact.roiPercent !== undefined
                    ? `${formatNumber(impact.roiPercent)} %`
                    : "Nicht berechenbar"
              }
            />
          </div>

          {showEconomics && (
            <p className="text-xs text-gray-500">
              {
                "Break-even und ROI basieren auf Kaufpreis bzw. überschriebenem Preis und dem täglichen Mehrgewinn."
              }
            </p>
          )}

          <div>
            <h3 className="mb-2 text-sm font-medium text-[#ead4aa]">
              {"Betroffene Kategorien"}
            </h3>
            {affectedCategories.length === 0 ? (
              <p className="text-sm text-gray-500">
                {enabled
                  ? "Kein messbarer Kategorie-Effekt."
                  : "Simulation deaktiviert."}
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {affectedCategories.map((cat) => (
                  <li
                    key={cat.key}
                    className="flex items-center justify-between rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a] px-3 py-2"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#ead4aa]">
                        {cat.label}
                      </span>
                      {cat.estimated && (
                        <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                          {"geschätzt"}
                        </span>
                      )}
                      {cat.status === "placeholder" && (
                        <span className="rounded bg-[#3e2731]/60 px-1.5 py-0.5 text-xs text-gray-400">
                          {"Platzhalter"}
                        </span>
                      )}
                    </div>
                    <span
                      className={`text-sm font-semibold ${deltaColorClass(cat.delta)}`}
                    >
                      {formatDelta(cat.delta)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a]/80 px-3 py-2 text-xs text-gray-500">
            <p className="font-medium text-gray-400">{"Ist vs. Simulation"}</p>
            <p className="mt-1">
              {
                "Ist: deine Farm mit allen owned Boosts. Simulation: zusätzlich der gewählte Boost (einzeln)."
              }
            </p>
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border p-3 ${
        highlight
          ? "border-amber-500/40 bg-amber-500/5"
          : "border-[#3e2731]/40 bg-[#0f0d1a]"
      }`}
    >
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p
        className={`mt-1 text-lg font-semibold ${
          highlight ? "text-amber-300" : "text-[#ead4aa]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
