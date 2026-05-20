import React, { useState } from "react";
import type {
  AnyBoost,
  FarmSkillState,
  GlobalParams,
  NftBoost,
  ResourceConfig,
  SkillBoost,
} from "../types";
import {
  calculateBoostBreakEvenDays,
  calculateBoostMarginalProfit,
} from "../utils/calculations";
import {
  canActivateSkill,
  getPrimaryBoostEffect,
  getSkillPointsSpent,
  isNftBoost,
  isSkillBoost,
} from "../utils/boosts";
import { formatBreakEven, formatNumber } from "../utils/format";

type BoostTab = "nfts" | "skills";

interface BoostPanelProps {
  nfts: NftBoost[];
  skills: SkillBoost[];
  experimentBoostIds: ReadonlySet<string>;
  resources: ResourceConfig[];
  globalParams: GlobalParams;
  farmSkillState: FarmSkillState;
  experimentActiveBoosts: AnyBoost[];
  onToggleExperiment: (id: string) => void;
}

function BoostChip({
  boost,
  variant,
}: {
  boost: AnyBoost;
  variant: "owned" | "experiment-active" | "experiment-inactive";
}) {
  const variantClass =
    variant === "owned"
      ? "border-[#3e2731]/60 bg-[#0f0d1a]"
      : variant === "experiment-active"
        ? "border-amber-500/60 bg-amber-500/10 ring-1 ring-amber-500/40"
        : "border-[#3e2731]/40 bg-[#0f0d1a]/80 opacity-70";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${variantClass}`}
    >
      <span className="text-[#ead4aa]">{boost.label}</span>
      <span
        className={`rounded px-1.5 py-0.5 text-xs uppercase ${
          boost.type === "NFT"
            ? "bg-purple-500/20 text-purple-300"
            : "bg-blue-500/20 text-blue-300"
        }`}
      >
        {boost.type}
      </span>
    </span>
  );
}

function ExperimentBoostRow({
  boost,
  isActive,
  resources,
  globalParams,
  experimentActiveBoosts,
  disabledReason,
  onToggle,
}: {
  boost: AnyBoost;
  isActive: boolean;
  resources: ResourceConfig[];
  globalParams: GlobalParams;
  experimentActiveBoosts: AnyBoost[];
  disabledReason?: string;
  onToggle: () => void;
}) {
  const baseForMarginal = experimentActiveBoosts.filter(
    (b) => b.id !== boost.id,
  );
  const marginal = isActive
    ? calculateBoostMarginalProfit(
        boost,
        resources,
        globalParams,
        baseForMarginal,
      )
    : null;
  const breakEven =
    isActive && isNftBoost(boost) && boost.priceFlw
      ? calculateBoostBreakEvenDays(
          boost,
          resources,
          globalParams,
          baseForMarginal,
        )
      : null;

  return (
    <div
      className={`flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between ${
        isActive
          ? "border-amber-500/50 bg-amber-500/5"
          : "border-[#3e2731]/40 bg-[#0f0d1a]"
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium text-[#ead4aa]">{boost.label}</span>
        <span className="text-xs uppercase text-gray-500">{boost.type}</span>
        {!boost.owned && (
          <span className="text-xs text-amber-400/80">{"Nicht owned"}</span>
        )}
        {isActive && (
          <span className="text-xs font-medium text-amber-300">{"Aktiv"}</span>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {isNftBoost(boost) && (
          <span className="text-sm text-gray-400">
            {"Preis: "}
            {formatNumber(boost.priceFlw)}
            {" FLW"}
          </span>
        )}
        {isSkillBoost(boost) && (
          <span className="text-sm text-gray-400">
            {"Kosten: "}
            {boost.skillPointCost}
            {" Skill-Punkt"}
            {boost.skillPointCost > 1 ? "e" : ""}
          </span>
        )}
        {isActive && marginal !== null && marginal > 0 && (
          <span className="text-sm text-green-400">
            {"+"}
            {formatNumber(marginal)}
            {" FLW/Tag"}
          </span>
        )}
        {breakEven !== null && (
          <span className="text-sm text-amber-300">
            {"Break-even: "}
            {formatBreakEven(breakEven)}
          </span>
        )}
        {!boost.owned && (
          <button
            type="button"
            onClick={onToggle}
            disabled={disabledReason !== undefined}
            title={disabledReason}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              disabledReason !== undefined
                ? "cursor-not-allowed bg-gray-700/50 text-gray-500"
                : isActive
                  ? "bg-amber-600/80 text-white hover:bg-amber-600"
                  : "bg-[#3e2731]/60 text-[#ead4aa] hover:bg-[#3e2731]"
            }`}
          >
            {isActive ? "Deaktivieren" : "Aktivieren"}
          </button>
        )}
        {disabledReason && (
          <span className="text-xs text-red-300">{disabledReason}</span>
        )}
      </div>
    </div>
  );
}

function groupByResource(boosts: AnyBoost[]): Map<string, AnyBoost[]> {
  const map = new Map<string, AnyBoost[]>();
  for (const b of boosts) {
    const key = getPrimaryBoostEffect(b).resource;
    const list = map.get(key) ?? [];
    list.push(b);
    map.set(key, list);
  }
  return map;
}

export function BoostPanel({
  nfts,
  skills,
  experimentBoostIds,
  resources,
  globalParams,
  farmSkillState,
  experimentActiveBoosts,
  onToggleExperiment,
}: BoostPanelProps) {
  const [activeTab, setActiveTab] = useState<BoostTab>("nfts");
  const boosts = activeTab === "nfts" ? nfts : skills;
  const ownedBoosts = [...nfts, ...skills].filter((b) => b.owned);
  const grouped = groupByResource(boosts);
  const allOwned = boosts.length > 0 && boosts.every((b) => b.owned);
  const activeSkills = skills
    .filter((skill) => skill.owned || experimentBoostIds.has(skill.id))
    .map((skill) => ({ ...skill, owned: true }));
  const activeFarmSkillState: FarmSkillState = {
    ...farmSkillState,
    skillPointsSpent: getSkillPointsSpent(activeSkills),
  };
  const skillPointsAvailable =
    activeFarmSkillState.skillPointsTotal -
    activeFarmSkillState.skillPointsSpent;

  return (
    <section className="flex flex-col gap-6">
      <article className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
        <h2 className="mb-3 text-lg font-semibold text-[#ead4aa]">
          {"Aktive Boosts (Ist)"}
        </h2>
        <p className="mb-4 text-xs text-gray-400">
          {"Boosts, die auf deiner Farm aktuell owned sind."}
        </p>
        {ownedBoosts.length === 0 ? (
          <p className="text-sm text-gray-500">{"Keine owned Boosts."}</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {ownedBoosts.map((b) => (
              <BoostChip key={b.id} boost={b} variant="owned" />
            ))}
          </div>
        )}
      </article>

      <article className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#ead4aa]">
            {"Experiment"}
          </h2>
          <div
            className="inline-flex rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] p-1"
            role="group"
            aria-label="Boost-Typ"
          >
            {(["nfts", "skills"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === tab
                    ? "bg-[#3e2731] text-[#ead4aa]"
                    : "text-gray-400 hover:text-[#ead4aa]"
                }`}
              >
                {tab === "nfts" ? "NFTs" : "Skills"}
              </button>
            ))}
          </div>
        </div>
        <p className="mb-4 text-xs text-gray-400">
          {
            "Zusätzliche Boosts simulieren (auch ohne Besitz). Owned Boosts sind immer aktiv."
          }
        </p>
        {activeTab === "nfts" && (
          <p className="mb-4 text-xs text-gray-500">
            {"NFTs zeigen den Kaufpreis in FLW."}
          </p>
        )}
        {activeTab === "skills" && (
          <p className="mb-4 text-xs text-gray-500">
            {"Farm-Level "}
            {activeFarmSkillState.farmLevel}
            {" · Skill-Punkte: "}
            {skillPointsAvailable}
            {" verfügbar / "}
            {activeFarmSkillState.skillPointsTotal}
            {" gesamt"}
          </p>
        )}

        {boosts.length === 0 ? (
          <p className="text-sm text-gray-500">
            {"Keine Boosts in der Config."}
          </p>
        ) : (
          <div className="flex flex-col gap-6">
            {[...grouped.entries()].map(([resource, list]) => (
              <div key={resource}>
                <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-gray-500">
                  {resource}
                </h3>
                <div className="flex flex-col gap-2">
                  {list.map((boost) => {
                    const isActive =
                      boost.owned || experimentBoostIds.has(boost.id);
                    const disabledReason =
                      isSkillBoost(boost) &&
                      !isActive &&
                      !canActivateSkill(boost, activeFarmSkillState)
                        ? "Nicht genug Skill-Punkte"
                        : undefined;

                    if (boost.owned) {
                      return (
                        <BoostChip
                          key={boost.id}
                          boost={boost}
                          variant="owned"
                        />
                      );
                    }

                    return (
                      <ExperimentBoostRow
                        key={boost.id}
                        boost={boost}
                        isActive={isActive}
                        resources={resources}
                        globalParams={globalParams}
                        experimentActiveBoosts={experimentActiveBoosts}
                        disabledReason={disabledReason}
                        onToggle={() => onToggleExperiment(boost.id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
            {allOwned && (
              <p className="mt-3 text-center text-sm text-gray-500">
                {
                  "Alle Boosts sind bereits aktiv — keine Experiment-Simulation möglich."
                }
              </p>
            )}
          </div>
        )}
      </article>
    </section>
  );
}
