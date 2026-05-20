import React from "react";
import type { ExperimentDelta, ResourceResult } from "../types";
import type { LabMode } from "../hooks/useLabState";
import {
  deltaColorClass,
  formatBreakEven,
  formatDelta,
  formatNumber,
} from "../utils/format";

interface ResourceCardProps {
  result: ResourceResult;
  delta?: ExperimentDelta;
  mode: LabMode;
  /** Delta-Block nur bei globalem Experiment-Ansichtsmodus */
  showDelta?: boolean;
  title?: string;
}

function MetricRow({
  label,
  value,
  unit,
}: {
  label: string;
  value: string;
  unit?: string;
}) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-400">{label}</span>
      <span className="text-right text-[#ead4aa]">
        {value}
        {unit ? ` ${unit}` : ""}
      </span>
    </div>
  );
}

export function ResourceCard({
  result,
  delta,
  mode,
  showDelta = false,
  title,
}: ResourceCardProps) {
  const isExperiment = mode === "experiment";

  return (
    <article className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-lg font-semibold text-[#ead4aa]">
          {title ?? result.resourceId}
        </h3>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
            isExperiment
              ? "bg-amber-500/20 text-amber-300"
              : "bg-[#3e2731]/50 text-gray-300"
          }`}
        >
          {isExperiment ? "Experiment" : "Ist"}
        </span>
      </header>

      <div className="flex flex-col gap-2">
        <MetricRow
          label="Produktion/Tag"
          value={formatNumber(result.productionPerDay)}
        />
        <MetricRow
          label="Coin-Kosten/Tag"
          value={formatNumber(result.coinCostPerDay)}
        />
        <MetricRow
          label="FLW-Kosten/Tag"
          value={formatNumber(result.flwCostPerDay)}
          unit="FLW"
        />
        {result.woodCostPerDay !== undefined && (
          <MetricRow
            label="Wood-Kosten/Tag"
            value={formatNumber(result.woodCostPerDay)}
          />
        )}
        <MetricRow
          label="P2P Revenue/Tag"
          value={formatNumber(result.p2pRevenueFlw)}
          unit="FLW"
        />
        <MetricRow
          label="P2P Profit/Tag"
          value={formatNumber(result.p2pProfitFlw)}
          unit="FLW"
        />
      </div>

      {showDelta && delta && (
        <div className="mt-4 border-t border-[#3e2731]/40 pt-4">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            {"Delta vs. Ist"}
          </p>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">{"Produktion"}</span>
              <span className={deltaColorClass(delta.productionDelta)}>
                {formatDelta(delta.productionDelta)}
                {"/Tag"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">{"Profit"}</span>
              <span className={deltaColorClass(delta.profitDelta)}>
                {formatDelta(delta.profitDelta)}
                {" FLW/Tag"}
              </span>
            </div>
            {delta.breakEvenDays !== null && (
              <div className="flex justify-between">
                <span className="text-gray-400">{"Break-even"}</span>
                <span className="text-amber-300">
                  {formatBreakEven(delta.breakEvenDays)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
