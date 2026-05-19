// SFL-Lab – Szenario-Defaults und Storage-Keys
import type { Scenario } from "../types/scenario";

export const SCENARIO_STORAGE_KEY = "sfl-lab.scenarios";
export const SCENARIO_ACTIVE_ID_KEY = "sfl-lab.activeScenarioId";
export const SCENARIO_LEGACY_PORTFOLIO_KEY = "sfl-lab.portfolio";

export const SCENARIO_DEFAULTS = {
  defaultScenarioName: "Standard",
  emptyPortfolio: {
    purchaseDates: {} as Record<string, string>,
    currentValues: {} as Record<string, string>,
  },
} as const;

function newScenarioId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `scenario-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createScenario(
  partial?: Partial<Pick<Scenario, "id" | "name" | "data">> & {
    createdAt?: string;
    updatedAt?: string;
  },
): Scenario {
  const now = new Date().toISOString();
  return {
    id: partial?.id ?? newScenarioId(),
    name: partial?.name ?? SCENARIO_DEFAULTS.defaultScenarioName,
    data: partial?.data ?? {
      portfolio: {
        purchaseDates: {
          ...SCENARIO_DEFAULTS.emptyPortfolio.purchaseDates,
        },
        currentValues: {
          ...SCENARIO_DEFAULTS.emptyPortfolio.currentValues,
        },
      },
    },
    createdAt: partial?.createdAt ?? now,
    updatedAt: partial?.updatedAt ?? now,
  };
}

export function createDefaultScenarios(): Scenario[] {
  return [createScenario({ name: SCENARIO_DEFAULTS.defaultScenarioName })];
}
