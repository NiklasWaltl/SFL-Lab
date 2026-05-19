// SFL-Lab – Szenario-Typen (localStorage-Persistenz)

export interface ScenarioPortfolioData {
  purchaseDates: Record<string, string>;
  currentValues: Record<string, string>;
}

export interface ScenarioData {
  portfolio: ScenarioPortfolioData;
}

export interface Scenario {
  id: string;
  name: string;
  data: ScenarioData;
  createdAt: string;
  updatedAt: string;
}
