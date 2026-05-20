import type { Scenario } from "../types";

function isValidImportedScenario(raw: unknown): raw is Scenario {
  if (!raw || typeof raw !== "object") return false;

  const obj = raw as Record<string, unknown>;
  if (typeof obj.id !== "string" || typeof obj.name !== "string") return false;

  const data = obj.data;
  if (!data || typeof data !== "object") return false;

  const portfolio = (data as Record<string, unknown>).portfolio;
  if (!portfolio || typeof portfolio !== "object") return false;

  const portfolioObj = portfolio as Record<string, unknown>;
  if (
    !portfolioObj.purchaseDates ||
    typeof portfolioObj.purchaseDates !== "object"
  ) {
    return false;
  }
  if (
    !portfolioObj.currentValues ||
    typeof portfolioObj.currentValues !== "object"
  ) {
    return false;
  }

  return true;
}

function toScenario(raw: Scenario): Scenario {
  const now = new Date().toISOString();
  return {
    ...raw,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : now,
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : now,
  };
}

export function exportScenario(scenario: Scenario): void {
  const json = JSON.stringify(scenario, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `sfl-scenario-${scenario.name.replace(/\s+/g, "-")}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function importScenario(
  file: File,
  onSuccess: (scenario: Scenario) => void,
  onError: (message: string) => void,
): void {
  const reader = new FileReader();

  reader.onload = () => {
    try {
      const text = reader.result;
      if (typeof text !== "string") {
        onError("Die Datei konnte nicht gelesen werden.");
        return;
      }

      const parsed: unknown = JSON.parse(text);
      if (!isValidImportedScenario(parsed)) {
        onError(
          "Ungültiges Szenario-Format. Erforderlich: id, name, data.portfolio.purchaseDates und data.portfolio.currentValues.",
        );
        return;
      }

      onSuccess(toScenario(parsed));
    } catch {
      onError("Die Datei enthält kein gültiges JSON.");
    }
  };

  reader.onerror = () => {
    onError("Die Datei konnte nicht gelesen werden.");
  };

  reader.readAsText(file);
}
