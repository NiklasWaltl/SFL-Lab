import React from "react";
import type { Boost } from "../../types";
import { formatNumber } from "../../utils/format";
import { getBoostDescription } from "../../utils/simulator";

export interface SimulatorPickerProps {
  boosts: Boost[];
  selectedBoostId: string | null;
  enabled: boolean;
  overridePriceFlw?: number;
  onSelectBoost: (boostId: string) => void;
  onToggleEnabled: () => void;
  onChangeOverridePrice: (value: number | undefined) => void;
}

export function SimulatorPicker({
  boosts,
  selectedBoostId,
  enabled,
  overridePriceFlw,
  onSelectBoost,
  onToggleEnabled,
  onChangeOverridePrice,
}: SimulatorPickerProps) {
  const selectedBoost = boosts.find((b) => b.id === selectedBoostId) ?? null;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <div>
        <h2 className="text-lg font-semibold text-[#ead4aa]">
          {"Boost / NFT wählen"}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {
            "Einzelnen Boost virtuell aktivieren – unabhängig vom globalen Experiment-Modus."
          }
        </p>
      </div>

      <ul className="flex max-h-[420px] flex-col gap-2 overflow-y-auto pr-1">
        {boosts.map((boost) => {
          const isSelected = boost.id === selectedBoostId;
          return (
            <li key={boost.id}>
              <button
                type="button"
                onClick={() => onSelectBoost(boost.id)}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/30"
                    : "border-[#3e2731]/40 bg-[#0f0d1a] hover:border-[#3e2731]/70"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[#ead4aa]">
                    {boost.label}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 text-xs uppercase ${
                      boost.source === "nft"
                        ? "bg-purple-500/20 text-purple-300"
                        : "bg-blue-500/20 text-blue-300"
                    }`}
                  >
                    {boost.source}
                  </span>
                  {boost.owned ? (
                    <span className="text-xs text-gray-500">{"Owned"}</span>
                  ) : (
                    <span className="text-xs text-amber-400/90">
                      {"Nicht owned"}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {getBoostDescription(boost)}
                </p>
                {boost.priceFlw !== undefined && boost.priceFlw > 0 && (
                  <p className="mt-1 text-xs text-gray-500">
                    {"Preis: "}
                    {formatNumber(boost.priceFlw)}
                    {" FLW"}
                  </p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {selectedBoost && (
        <div className="rounded-lg border border-[#3e2731]/50 bg-[#0f0d1a] p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-[#ead4aa]">
              {"Simulation aktiv"}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={onToggleEnabled}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
                enabled ? "bg-amber-600" : "bg-[#3e2731]/80"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white transition-transform ${
                  enabled ? "translate-x-5" : ""
                }`}
              />
            </button>
          </div>

          <label className="mt-3 block">
            <span className="text-xs text-gray-500">
              {"Preis überschreiben (FLW, optional)"}
            </span>
            <input
              type="number"
              min={0}
              step={0.01}
              placeholder={
                selectedBoost.priceFlw !== undefined
                  ? formatNumber(selectedBoost.priceFlw)
                  : "—"
              }
              value={overridePriceFlw ?? ""}
              onChange={(e) => {
                const raw = e.target.value;
                if (raw === "") {
                  onChangeOverridePrice(undefined);
                  return;
                }
                const parsed = parseFloat(raw);
                onChangeOverridePrice(
                  Number.isFinite(parsed) ? parsed : undefined,
                );
              }}
              className="mt-1 w-full rounded-lg border border-[#3e2731]/60 bg-[#181425] px-3 py-2 text-sm text-[#ead4aa] outline-none focus:border-amber-500/50"
            />
          </label>
        </div>
      )}
    </section>
  );
}
