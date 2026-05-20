export type ResourcePrices = Record<string, number>;

export const MARKET_RATES_URL = "/api/market";

function toResourcePrices(obj: Record<string, unknown>): ResourcePrices {
  const result: ResourcePrices = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      result[key] = value;
      continue;
    }

    if (typeof value === "string") {
      const parsed = parseFloat(value);
      if (Number.isFinite(parsed)) {
        result[key] = parsed;
      }
    }
  }

  if (Object.keys(result).length === 0) {
    throw new Error("Keine gültigen Preise in der API-Response");
  }

  return result;
}

function mapMarketRatesResponse(data: unknown): ResourcePrices {
  if (!data || typeof data !== "object") {
    throw new Error("Ungültige Marktpreis-Response");
  }

  const obj = data as Record<string, unknown>;

  if (obj.rates && typeof obj.rates === "object" && obj.rates !== null) {
    return toResourcePrices(obj.rates as Record<string, unknown>);
  }

  if (
    obj.currentPrices &&
    typeof obj.currentPrices === "object" &&
    obj.currentPrices !== null
  ) {
    return toResourcePrices(obj.currentPrices as Record<string, unknown>);
  }

  return toResourcePrices(obj);
}

export async function fetchMarketPrices(): Promise<ResourcePrices> {
  const res = await fetch(MARKET_RATES_URL);

  if (!res.ok) {
    throw new Error(
      `Marktpreise konnten nicht geladen werden (HTTP ${res.status})`,
    );
  }

  const data: unknown = await res.json();
  return mapMarketRatesResponse(data);
}
