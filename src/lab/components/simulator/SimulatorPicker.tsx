import React from "react";
import type { FarmSkillState, NftBoost, SkillBoost } from "../../types";
import { isBoostOwned } from "../../utils/boosts";
import { formatNumber } from "../../utils/format";
import { getBoostDescription } from "../../utils/simulator";

export interface SimulatorPickerProps {
  nfts: NftBoost[];
  skills: SkillBoost[];
  farmSkillState: FarmSkillState;
  simulatedFarmLevel: number;
  effectiveFarmLevel: number;
  maxSimulatedFarmLevel: number;
  simSkillPointsTotal: number;
  simSkillPointsAvailable: number;
  selectedNftId: string | null;
  selectedSkillId: string | null;
  enabled: boolean;
  overridePriceFlw?: number;
  canSimulateSkill: (skill: SkillBoost) => boolean;
  onChangeSimulatedFarmLevel: (value: number) => void;
  onSelectNft: (boostId: string) => void;
  onSelectSkill: (boostId: string) => void;
  onToggleEnabled: () => void;
  onChangeOverridePrice: (value: number | undefined) => void;
}

export function SimulatorPicker({
  nfts,
  skills,
  farmSkillState,
  simulatedFarmLevel,
  effectiveFarmLevel,
  maxSimulatedFarmLevel,
  simSkillPointsTotal,
  simSkillPointsAvailable,
  selectedNftId,
  selectedSkillId,
  enabled,
  overridePriceFlw,
  canSimulateSkill,
  onChangeSimulatedFarmLevel,
  onSelectNft,
  onSelectSkill,
  onToggleEnabled,
  onChangeOverridePrice,
}: SimulatorPickerProps) {
  const selectedNft = nfts.find((b) => b.id === selectedNftId) ?? null;
  const selectedSkill = skills.find((b) => b.id === selectedSkillId) ?? null;
  const isSimulatedLevel = effectiveFarmLevel > farmSkillState.farmLevel;

  return (
    <section className="flex flex-col gap-4 rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <div>
        <h2 className="text-lg font-semibold text-[#ead4aa]">{"NFT wählen"}</h2>
        <p className="mt-1 text-xs text-gray-400">
          {
            "Einzelnen Boost virtuell aktivieren – unabhängig vom globalen Experiment-Modus."
          }
        </p>
      </div>

      <ul className="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
        {nfts.map((boost) => {
          const isSelected = boost.id === selectedNftId;
          const owned = isBoostOwned(boost);
          return (
            <li key={boost.id}>
              <button
                type="button"
                onClick={() => onSelectNft(boost.id)}
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
                  <span className="rounded bg-purple-500/20 px-1.5 py-0.5 text-xs uppercase text-purple-300">
                    {boost.type}
                  </span>
                  {owned ? (
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
                {boost.priceFlw > 0 && (
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

      <div className="border-t border-[#3e2731]/40 pt-4">
        <label className="mb-3 block rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a] p-3">
          <span className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
            {"Simuliertes Farm Level"}
            {isSimulatedLevel && (
              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                {"Simuliertes Level"}
              </span>
            )}
          </span>
          <input
            type="number"
            min={farmSkillState.farmLevel}
            max={maxSimulatedFarmLevel}
            step={1}
            value={simulatedFarmLevel}
            onChange={(e) => {
              const parsed = parseInt(e.target.value, 10);
              onChangeSimulatedFarmLevel(
                Number.isFinite(parsed) ? parsed : farmSkillState.farmLevel,
              );
            }}
            className="mt-1 w-full rounded-lg border border-[#3e2731]/60 bg-[#181425] px-3 py-2 text-sm text-[#ead4aa] outline-none focus:border-amber-500/50"
          />
        </label>

        <h2 className="text-lg font-semibold text-[#ead4aa]">
          {"Skill wählen"}
        </h2>
        <p className="mt-1 text-xs text-gray-400">
          {"Skill-Punkte: "}
          {simSkillPointsAvailable}
          {" / "}
          {simSkillPointsTotal}
          {isSimulatedLevel
            ? " verfügbar (Sim. Level "
            : " verfügbar (Farm Level "}
          {effectiveFarmLevel}
          {")"}
        </p>
      </div>

      <ul className="flex max-h-[260px] flex-col gap-2 overflow-y-auto pr-1">
        {skills.map((skill) => {
          const isSelected = skill.id === selectedSkillId;
          const owned = isBoostOwned(skill);
          const canSelect = canSimulateSkill(skill);
          const disabledReason = canSelect
            ? undefined
            : "Nicht genug simulierte Skill-Punkte – erhöhe das simulierte Farm Level.";

          return (
            <li key={skill.id} title={disabledReason}>
              <button
                type="button"
                onClick={() => onSelectSkill(skill.id)}
                disabled={!canSelect}
                title={disabledReason}
                className={`w-full rounded-xl border p-3 text-left transition-colors ${
                  isSelected
                    ? "border-blue-500/60 bg-blue-500/10 ring-1 ring-blue-500/30"
                    : "border-[#3e2731]/40 bg-[#0f0d1a] hover:border-[#3e2731]/70"
                } ${
                  !canSelect
                    ? "cursor-not-allowed opacity-45 hover:border-[#3e2731]/40"
                    : ""
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-[#ead4aa]">
                    {skill.label}
                  </span>
                  <span className="rounded bg-blue-500/20 px-1.5 py-0.5 text-xs uppercase text-blue-300">
                    {"Skill"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {skill.skillPointCost}
                    {" SP"}
                  </span>
                  {owned ? (
                    <span className="text-xs text-emerald-300">
                      {"Bereits gelernt"}
                    </span>
                  ) : (
                    <span className="text-xs text-amber-400/90">
                      {"Nicht owned"}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-400">
                  {getBoostDescription(skill)}
                </p>
                {disabledReason && (
                  <p className="mt-1 text-xs text-red-300">{disabledReason}</p>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {(selectedNft || selectedSkill) && (
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

          {selectedNft && (
            <label className="mt-3 block">
              <span className="text-xs text-gray-500">
                {"Preis überschreiben (FLW, optional)"}
              </span>
              <input
                type="number"
                min={0}
                step={0.01}
                placeholder={
                  selectedNft.priceFlw > 0
                    ? formatNumber(selectedNft.priceFlw)
                    : "-"
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
          )}
        </div>
      )}
    </section>
  );
}
