import prices from "../config/defaultPrices.json";
import type { MarketPriceMap, MarketPricesResponse } from "../types";

export const MARKET_RATES_URL = "/api/market";

type DefaultPrices = Record<string, number | string | undefined> & {
  lastUpdated?: string;
};

function getDefaultPrices(): {
  prices: MarketPriceMap;
  lastUpdated?: string;
} {
  const { lastUpdated, ...rawPrices } = prices as DefaultPrices;
  const fallbackPrices: MarketPriceMap = {};

  for (const [key, value] of Object.entries(rawPrices)) {
    if (typeof value === "number" && Number.isFinite(value)) {
      fallbackPrices[key] = value;
    }
  }

  return { prices: fallbackPrices, lastUpdated };
}

function getFallbackMarketPrices(errorMessage?: string): MarketPricesResponse {
  const fallback = getDefaultPrices();

  return {
    prices: fallback.prices,
    isLive: false,
    lastUpdated: fallback.lastUpdated,
    errorMessage,
  };
}

function toResourcePrices(obj: Record<string, unknown>): MarketPriceMap {
  const result: MarketPriceMap = {};

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

function mapMarketRatesResponse(data: unknown): MarketPriceMap {
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

export async function fetchMarketPrices(): Promise<MarketPricesResponse> {
  try {
    const res = await fetch(MARKET_RATES_URL);

    if (!res.ok) {
      return getFallbackMarketPrices(
        "Marktpreise nicht erreichbar – Fallback aktiv",
      );
    }

    const data: unknown = await res.json();
    const fallback = getDefaultPrices();
    return {
      prices: {
        ...fallback.prices,
        ...mapMarketRatesResponse(data),
      },
      isLive: true,
    };
  } catch {
    return getFallbackMarketPrices(
      "Marktpreise nicht erreichbar – Fallback aktiv",
    );
  }
}
