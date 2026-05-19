import React, { useState } from "react";
import { createScenario } from "../config/scenario.config";
import type { useScenarioPersistence } from "../hooks/useScenarioPersistence";
import type { Scenario } from "../types/scenario";

interface ScenariosTabProps {
  scenarioPersistence: ReturnType<typeof useScenarioPersistence>;
}

function formatUpdatedAt(iso: string): string {
  return new Date(iso).toLocaleDateString("de-AT");
}

interface ScenarioRowProps {
  scenario: Scenario;
  isActive: boolean;
  isEditing: boolean;
  editingName: string;
  onEditingNameChange: (name: string) => void;
  onStartRename: () => void;
  onSaveRename: () => void;
  onCancelRename: () => void;
  onSetActive: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
}

function ScenarioRow({
  scenario,
  isActive,
  isEditing,
  editingName,
  onEditingNameChange,
  onStartRename,
  onSaveRename,
  onCancelRename,
  onSetActive,
  onDuplicate,
  onDelete,
}: ScenarioRowProps) {
  return (
    <article
      className={`rounded-xl border p-4 transition-colors ${
        isActive
          ? "border-amber-500/50 bg-[#181425]"
          : "border-[#3e2731]/50 bg-[#181425]/80"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                value={editingName}
                onChange={(e) => onEditingNameChange(e.target.value)}
                className="rounded bg-[#0f0d1a] border border-[#3e2731]/50 text-[#ead4aa] px-2 py-1 text-sm min-w-[12rem]"
                autoFocus
              />
              <button
                type="button"
                onClick={onSaveRename}
                className="rounded-md bg-amber-700/70 px-2 py-1 text-xs font-medium text-amber-100 hover:bg-amber-600/80"
              >
                {"Speichern"}
              </button>
              <button
                type="button"
                onClick={onCancelRename}
                className="rounded-md bg-[#1a1730] px-2 py-1 text-xs text-gray-400 hover:text-[#ead4aa]"
              >
                {"Abbrechen"}
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <h3
                className={`text-base ${
                  isActive
                    ? "font-bold text-[#ead4aa]"
                    : "font-medium text-[#ead4aa]/90"
                }`}
              >
                {scenario.name}
              </h3>
              {isActive && (
                <span className="rounded bg-amber-700/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-200">
                  {"Aktiv"}
                </span>
              )}
            </div>
          )}
          <p className="mt-1 text-xs text-gray-500">
            {"Zuletzt geändert: "}
            {formatUpdatedAt(scenario.updatedAt)}
          </p>
        </div>

        {!isEditing && (
          <div className="flex flex-wrap gap-2">
            {!isActive && (
              <button
                type="button"
                onClick={onSetActive}
                className="rounded-md border border-[#3e2731]/60 bg-[#0f0d1a] px-2 py-1 text-xs text-gray-300 hover:text-[#ead4aa]"
              >
                {"Aktiv setzen"}
              </button>
            )}
            <button
              type="button"
              onClick={onStartRename}
              className="rounded-md border border-[#3e2731]/60 bg-[#0f0d1a] px-2 py-1 text-xs text-gray-300 hover:text-[#ead4aa]"
            >
              {"Umbenennen"}
            </button>
            <button
              type="button"
              onClick={onDuplicate}
              className="rounded-md border border-[#3e2731]/60 bg-[#0f0d1a] px-2 py-1 text-xs text-gray-300 hover:text-[#ead4aa]"
            >
              {"Duplizieren"}
            </button>
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-red-900/50 bg-red-950/30 px-2 py-1 text-xs text-red-300 hover:bg-red-900/40"
            >
              {"Löschen"}
            </button>
          </div>
        )}
      </div>
    </article>
  );
}

export function ScenariosTab({ scenarioPersistence }: ScenariosTabProps) {
  const {
    scenarios,
    activeScenarioId,
    setActiveScenarioId,
    saveScenario,
    deleteScenario,
    dupScenario,
    renameScenario,
  } = scenarioPersistence;

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const handleNew = () => {
    const created = createScenario({ name: "Neues Szenario" });
    saveScenario(created);
    setActiveScenarioId(created.id);
  };

  const handleStartRename = (scenario: Scenario) => {
    setEditingId(scenario.id);
    setEditingName(scenario.name);
  };

  const handleSaveRename = () => {
    if (!editingId) return;
    const trimmed = editingName.trim();
    if (trimmed) {
      renameScenario(editingId, trimmed);
    }
    setEditingId(null);
    setEditingName("");
  };

  const handleCancelRename = () => {
    setEditingId(null);
    setEditingName("");
  };

  const handleDelete = (scenario: Scenario) => {
    const confirmed = window.confirm(`Szenario "${scenario.name}" löschen?`);
    if (!confirmed) return;
    deleteScenario(scenario.id);
    if (editingId === scenario.id) {
      setEditingId(null);
      setEditingName("");
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-xl font-bold text-[#ead4aa]">{"Szenarien"}</h2>
        <p className="mt-1 text-sm text-gray-400">
          {
            "Verwalte Portfolio-Snapshots. Das aktive Szenario wird im Portfolio-Tab verwendet."
          }
        </p>
      </header>

      <div>
        <button
          type="button"
          onClick={handleNew}
          className="rounded-lg bg-amber-700/70 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-600/80 transition-colors"
        >
          {"+ Neues Szenario"}
        </button>
      </div>

      {scenarios.length === 0 ? (
        <p className="text-sm text-gray-500">{"Keine Szenarien vorhanden."}</p>
      ) : (
        <div className="space-y-3">
          {scenarios.map((scenario) => (
            <ScenarioRow
              key={scenario.id}
              scenario={scenario}
              isActive={scenario.id === activeScenarioId}
              isEditing={editingId === scenario.id}
              editingName={editingName}
              onEditingNameChange={setEditingName}
              onStartRename={() => handleStartRename(scenario)}
              onSaveRename={handleSaveRename}
              onCancelRename={handleCancelRename}
              onSetActive={() => setActiveScenarioId(scenario.id)}
              onDuplicate={() => dupScenario(scenario.id)}
              onDelete={() => handleDelete(scenario)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
