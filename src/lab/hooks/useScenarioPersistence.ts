import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SCENARIO_ACTIVE_ID_KEY,
  SCENARIO_LEGACY_PORTFOLIO_KEY,
  SCENARIO_STORAGE_KEY,
  createDefaultScenarios,
  createScenario,
} from "../config/scenario.config";
import type { Scenario, ScenarioPortfolioData } from "../types";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function normalizePortfolioData(raw: unknown): ScenarioPortfolioData | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  const purchaseDates =
    obj.purchaseDates && typeof obj.purchaseDates === "object"
      ? (obj.purchaseDates as Record<string, string>)
      : {};
  const currentValues =
    obj.currentValues && typeof obj.currentValues === "object"
      ? (obj.currentValues as Record<string, string>)
      : {};
  return { purchaseDates, currentValues };
}

function normalizeScenario(raw: unknown): Scenario | null {
  if (!raw || typeof raw !== "object") return null;
  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== "string" || typeof obj.name !== "string") return null;

  const portfolio =
    obj.data &&
    typeof obj.data === "object" &&
    (obj.data as Record<string, unknown>).portfolio
      ? normalizePortfolioData((obj.data as Record<string, unknown>).portfolio)
      : normalizePortfolioData(obj.portfolio);

  if (!portfolio) return null;

  const now = new Date().toISOString();
  return {
    id: obj.id,
    name: obj.name,
    data: { portfolio },
    createdAt: typeof obj.createdAt === "string" ? obj.createdAt : now,
    updatedAt: typeof obj.updatedAt === "string" ? obj.updatedAt : now,
  };
}

export function migrateScenarios(oldScenarios: unknown): Scenario[] {
  if (!Array.isArray(oldScenarios)) return [];

  const migrated = oldScenarios
    .map(normalizeScenario)
    .filter((s): s is Scenario => s !== null);

  if (migrated.length > 0) return migrated;

  return [];
}

function readLegacyPortfolio(): ScenarioPortfolioData | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SCENARIO_LEGACY_PORTFOLIO_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    const portfolio = normalizePortfolioData(parsed);
    if (portfolio) {
      localStorage.removeItem(SCENARIO_LEGACY_PORTFOLIO_KEY);
    }
    return portfolio;
  } catch {
    return null;
  }
}

export function initializeDefaults(): Scenario[] {
  const legacy = readLegacyPortfolio();
  if (legacy) {
    return [
      createScenario({
        data: { portfolio: legacy },
      }),
    ];
  }
  return createDefaultScenarios();
}

function persistScenarios(scenarios: Scenario[]): void {
  if (!isBrowser()) return;
  localStorage.setItem(SCENARIO_STORAGE_KEY, JSON.stringify(scenarios));
}

function persistActiveId(id: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(SCENARIO_ACTIVE_ID_KEY, id);
}

function readStoredScenariosRaw(): unknown {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(SCENARIO_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export function loadScenariosFromStorage(): Scenario[] {
  const stored = readStoredScenariosRaw();
  if (stored === null) return initializeDefaults();

  const migrated = migrateScenarios(stored);
  if (migrated.length === 0) return initializeDefaults();

  return migrated;
}

function readStoredActiveId(scenarios: Scenario[]): string | undefined {
  if (!isBrowser()) return scenarios[0]?.id;

  try {
    const id = localStorage.getItem(SCENARIO_ACTIVE_ID_KEY);
    if (id && scenarios.some((s) => s.id === id)) return id;
  } catch {
    // ignore
  }

  return scenarios[0]?.id;
}

export function useScenarioPersistence() {
  const [scenarios, setScenarios] = useState<Scenario[]>(() =>
    loadScenariosFromStorage(),
  );
  const [activeScenarioId, setActiveScenarioIdState] = useState<
    string | undefined
  >(() => {
    const initial = loadScenariosFromStorage();
    return readStoredActiveId(initial);
  });

  const loadScenarios = useCallback((): Scenario[] => {
    const loaded = loadScenariosFromStorage();
    setScenarios(loaded);
    const activeId = readStoredActiveId(loaded);
    setActiveScenarioIdState(activeId);
    return loaded;
  }, []);

  const setActiveScenarioId = useCallback((id: string) => {
    setActiveScenarioIdState(id);
  }, []);

  const saveScenario = useCallback((scenario: Scenario) => {
    setScenarios((prev) => {
      const idx = prev.findIndex((s) => s.id === scenario.id);
      const updated: Scenario = {
        ...scenario,
        updatedAt: new Date().toISOString(),
      };
      if (idx === -1) return [...prev, updated];
      const next = [...prev];
      next[idx] = updated;
      return next;
    });
  }, []);

  const saveAllScenarios = useCallback((list: Scenario[]) => {
    setScenarios(list);
  }, []);

  const deleteScenario = useCallback((id: string) => {
    setScenarios((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (next.length === 0) return initializeDefaults();
      return next;
    });
  }, []);

  const dupScenario = useCallback((id: string) => {
    setScenarios((prev) => {
      const source = prev.find((s) => s.id === id);
      if (!source) return prev;
      const copy = createScenario({
        name: `${source.name} (Kopie)`,
        data: {
          portfolio: {
            purchaseDates: { ...source.data.portfolio.purchaseDates },
            currentValues: { ...source.data.portfolio.currentValues },
          },
        },
      });
      return [...prev, copy];
    });
  }, []);

  const renameScenario = useCallback((id: string, name: string) => {
    setScenarios((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, name, updatedAt: new Date().toISOString() } : s,
      ),
    );
  }, []);

  useEffect(() => {
    persistScenarios(scenarios);
  }, [scenarios]);

  const resolvedActiveScenarioId = useMemo(() => {
    if (scenarios.length === 0) return undefined;
    if (activeScenarioId && scenarios.some((s) => s.id === activeScenarioId)) {
      return activeScenarioId;
    }
    return scenarios[0].id;
  }, [scenarios, activeScenarioId]);

  useEffect(() => {
    if (resolvedActiveScenarioId) persistActiveId(resolvedActiveScenarioId);
  }, [resolvedActiveScenarioId]);

  return {
    scenarios,
    activeScenarioId: resolvedActiveScenarioId,
    setActiveScenarioId,
    saveScenario,
    saveAllScenarios,
    deleteScenario,
    dupScenario,
    renameScenario,
    loadScenarios,
  };
}
