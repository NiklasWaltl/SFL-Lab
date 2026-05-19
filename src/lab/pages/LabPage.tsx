import React, { useMemo, useState } from "react";
import { LabTabNav, TABS, type TabId } from "../components/LabTabNav";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useLabState, type LabMode } from "../hooks/useLabState";
import { usePlayerData } from "../hooks/usePlayerData";
import { normalizeFarm } from "../utils/normalizePlayer";
import { CategoriesTab } from "./CategoriesTab";
import { OverviewTab } from "./OverviewTab";

function ModeToggle({
  mode,
  onChange,
}: {
  mode: LabMode;
  onChange: (mode: LabMode) => void;
}) {
  return (
    <div
      className="inline-flex rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] p-1"
      role="group"
      aria-label="Ansichtsmodus"
    >
      <button
        type="button"
        onClick={() => onChange("actual")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "actual"
            ? "bg-[#3e2731] text-[#ead4aa]"
            : "text-gray-400 hover:text-[#ead4aa]"
        }`}
      >
        {"Ist"}
      </button>
      <button
        type="button"
        onClick={() => onChange("experiment")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "experiment"
            ? "bg-amber-600/80 text-white"
            : "text-gray-400 hover:text-[#ead4aa]"
        }`}
      >
        {"Experiment"}
      </button>
    </div>
  );
}

function formatFetchedAt(date: Date | null): string {
  if (!date) return "—";
  return date.toLocaleTimeString("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LabPage() {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const lab = useLabState();
  const { playerData, loading, error, isMock, fetchedAt } = usePlayerData();

  const farm = useMemo(
    () => (playerData ? normalizeFarm(playerData) : null),
    [playerData],
  );

  const activeTabLabel =
    TABS.find((t) => t.id === activeTab)?.label ?? activeTab;

  return (
    <div className="min-h-full bg-[#0f0d1a] text-[#ead4aa]">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#ead4aa] sm:text-3xl">
                {"SFL-Lab"}
              </h1>
              {farm && (
                <p className="mt-1 text-sm text-gray-300">
                  {"Farm #"}
                  {farm.farmId}
                  {farm.level > 0 && (
                    <span className="text-gray-500">
                      {" · Level "}
                      {farm.level}
                    </span>
                  )}
                </p>
              )}
              <p className="mt-0.5 text-xs text-gray-500">
                {"Letzte Aktualisierung: "}
                {formatFetchedAt(fetchedAt)}
              </p>
            </div>
            <ModeToggle mode={lab.mode} onChange={lab.setMode} />
          </div>

          <LabTabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </header>

        <main>
          {activeTab === "overview" && (
            <OverviewTab
              farm={farm}
              actualResults={lab.actualResults}
              experimentResults={lab.experimentResults}
              deltas={lab.deltas}
              loading={loading}
              isMock={isMock}
              error={error}
              globalParams={lab.globalParams}
              setGlobalParam={lab.setGlobalParam}
              resources={lab.resources}
              boosts={lab.boosts}
              experimentBoostIds={lab.experimentBoostIds}
              toggleExperimentBoost={lab.toggleExperimentBoost}
              actualActiveBoosts={lab.actualActiveBoosts}
              experimentActiveBoosts={lab.experimentActiveBoosts}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              farm={farm}
              actualResults={lab.actualResults}
              experimentResults={lab.experimentResults}
              deltas={lab.deltas}
              loading={loading}
              isMock={isMock}
              error={error}
              globalParams={lab.globalParams}
              resources={lab.resources}
              boosts={lab.boosts}
              actualActiveBoosts={lab.actualActiveBoosts}
              experimentActiveBoosts={lab.experimentActiveBoosts}
            />
          )}

          {activeTab !== "overview" && activeTab !== "categories" && (
            <TabPlaceholder label={activeTabLabel} />
          )}
        </main>
      </div>
    </div>
  );
}
