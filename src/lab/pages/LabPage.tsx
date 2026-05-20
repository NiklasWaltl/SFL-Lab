import React, { useMemo, useState } from "react";
import { LabTabNav, TABS, type TabId } from "../components/LabTabNav";
import { TabPlaceholder } from "../components/TabPlaceholder";
import { useFarmSkillState } from "../hooks/useFarmSkillState";
import { useLabState, type LabMode } from "../hooks/useLabState";
import { usePlayerData } from "../hooks/usePlayerData";
import { useScenarioPersistence } from "../hooks/useScenarioPersistence";
import { normalizeFarm } from "../utils/normalizePlayer";
import { CategoriesTab } from "./CategoriesTab";
import { OverviewTab } from "./OverviewTab";
import { PortfolioTab } from "./PortfolioTab";
import { ScenariosTab } from "./ScenariosTab";
import { SimulatorTab } from "./SimulatorTab";

function ModeToggle({
  mode,
  activeBoostCount,
  onChange,
}: {
  mode: LabMode;
  activeBoostCount: number;
  onChange: (mode: LabMode) => void;
}) {
  const showExperimentBadge = activeBoostCount > 0 && mode === "actual";

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
        title={
          showExperimentBadge
            ? `${activeBoostCount} Experiment-Boost(s) aktiv`
            : undefined
        }
        className={`relative rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          mode === "experiment"
            ? "bg-amber-600/80 text-white"
            : "text-gray-400 hover:text-[#ead4aa]"
        }`}
      >
        {"Experiment"}
        {showExperimentBadge && (
          <span className="absolute -right-1 -top-1 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
          </span>
        )}
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
  const scenarioPersistence = useScenarioPersistence();
  const {
    farmId,
    setFarmId,
    apiKey,
    setApiKey,
    playerData,
    loading,
    error,
    isMock,
    fetchedAt,
  } = usePlayerData();

  const farm = useMemo(
    () => (playerData ? normalizeFarm(playerData) : null),
    [playerData],
  );
  const { farmSkillState, skills } = useFarmSkillState({
    playerData,
    farmLevel: farm?.level ?? 0,
    skills: lab.skills,
  });
  const boosts = useMemo(() => [...lab.nfts, ...skills], [lab.nfts, skills]);

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
            <ModeToggle
              mode={lab.mode}
              activeBoostCount={lab.experimentBoostIds.size}
              onChange={lab.setMode}
            />
          </div>

          <LabTabNav activeTab={activeTab} onTabChange={setActiveTab} />
        </header>

        <main>
          {activeTab === "overview" && (
            <OverviewTab
              farmId={farmId}
              setFarmId={setFarmId}
              apiKey={apiKey}
              setApiKey={setApiKey}
              mode={lab.mode}
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
              boosts={boosts}
              nfts={lab.nfts}
              skills={skills}
              farmSkillState={farmSkillState}
              experimentBoostIds={lab.experimentBoostIds}
              toggleExperimentBoost={lab.toggleExperimentBoost}
              onResetExperiment={lab.resetExperiment}
              experimentActiveBoosts={lab.experimentActiveBoosts}
            />
          )}

          {activeTab === "categories" && (
            <CategoriesTab
              mode={lab.mode}
              farm={farm}
              actualResults={lab.actualResults}
              experimentResults={lab.experimentResults}
              deltas={lab.deltas}
              loading={loading}
              isMock={isMock}
              error={error}
              globalParams={lab.globalParams}
              resources={lab.resources}
              boosts={boosts}
              actualActiveBoosts={lab.actualActiveBoosts}
              experimentActiveBoosts={lab.experimentActiveBoosts}
            />
          )}

          {activeTab === "simulator" && (
            <SimulatorTab
              nfts={lab.nfts}
              skills={skills}
              farmSkillState={farmSkillState}
              baseState={{
                resources: lab.resources,
                globalParams: lab.globalParams,
              }}
            />
          )}

          {activeTab === "portfolio" && (
            <PortfolioTab
              boosts={boosts}
              resources={lab.resources}
              globalParams={lab.globalParams}
              actualActiveBoosts={lab.actualActiveBoosts}
              actualResults={lab.actualResults}
              loading={loading}
              isMock={isMock}
              error={error}
              farmSkillState={farmSkillState}
              scenarioPersistence={scenarioPersistence}
            />
          )}

          {activeTab === "scenarios" && (
            <ScenariosTab scenarioPersistence={scenarioPersistence} />
          )}

          {activeTab !== "overview" &&
            activeTab !== "categories" &&
            activeTab !== "simulator" &&
            activeTab !== "portfolio" &&
            activeTab !== "scenarios" && (
              <TabPlaceholder label={activeTabLabel} />
            )}
        </main>
      </div>
    </div>
  );
}
