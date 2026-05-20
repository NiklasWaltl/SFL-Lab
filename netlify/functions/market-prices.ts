import type { Handler } from "@netlify/functions";

const PUBLIC_ENDPOINTS = [
  "https://api.sunflower-land.com/community/trades/rates",
  "https://api.sunflower-land.com/marketplace/listings?resource=Wood",
  "https://api.sunflower-land.com/community/marketplace/listings",
] as const;

const TARGET_RESOURCES = ["Wood", "Stone"] as const;

type TargetResource = (typeof TARGET_RESOURCES)[number];
type MarketPriceResponse = Record<TargetResource, number>;

const CACHE_HEADERS = {
  "Cache-Control": "public, max-age=300",
  "Content-Type": "application/json",
};

const SERVICE_UNAVAILABLE = {
  statusCode: 503,
  headers: CACHE_HEADERS,
  body: JSON.stringify({ error: "No public price data available" }),
};

function median(values: number[]): number | undefined {
  if (values.length === 0) {
    return undefined;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

function parseFiniteNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function extractRates(data: unknown): Partial<MarketPriceResponse> | null {
  if (!data || typeof data !== "object") {
    return null;
  }

  const root = data as Record<string, unknown>;
  const candidates: Record<string, unknown>[] = [root];

  if (root.rates && typeof root.rates === "object" && root.rates !== null) {
    candidates.unshift(root.rates as Record<string, unknown>);
  }

  if (
    root.currentPrices &&
    typeof root.currentPrices === "object" &&
    root.currentPrices !== null
  ) {
    candidates.unshift(root.currentPrices as Record<string, unknown>);
  }

  const result: Partial<MarketPriceResponse> = {};

  for (const source of candidates) {
    for (const resource of TARGET_RESOURCES) {
      if (result[resource] !== undefined) {
        continue;
      }

      const price = parseFiniteNumber(source[resource]);
      if (price !== undefined) {
        result[resource] = price;
      }
    }
  }

  return Object.keys(result).length > 0 ? result : null;
}

type ListingRecord = Record<string, unknown>;

function extractListings(data: unknown): ListingRecord[] {
  if (Array.isArray(data)) {
    return data.filter(
      (entry): entry is ListingRecord =>
        !!entry && typeof entry === "object" && !Array.isArray(entry),
    );
  }

  if (!data || typeof data !== "object") {
    return [];
  }

  const root = data as Record<string, unknown>;
  const nestedKeys = ["listings", "data", "results", "items"] as const;

  for (const key of nestedKeys) {
    const nested = root[key];
    if (Array.isArray(nested)) {
      return extractListings(nested);
    }
  }

  return [];
}

function listingUnitPrice(listing: ListingRecord): number | undefined {
  const sfl = parseFiniteNumber(listing.sfl);
  const directQuantity = parseFiniteNumber(listing.quantity);

  if (sfl !== undefined && directQuantity !== undefined && directQuantity > 0) {
    return sfl / directQuantity;
  }

  if (
    listing.items &&
    typeof listing.items === "object" &&
    listing.items !== null
  ) {
    const items = listing.items as Record<string, unknown>;

    for (const resource of TARGET_RESOURCES) {
      const quantity = parseFiniteNumber(items[resource]);
      if (sfl !== undefined && quantity !== undefined && quantity > 0) {
        return sfl / quantity;
      }
    }

    const quantities = Object.values(items)
      .map(parseFiniteNumber)
      .filter((value): value is number => value !== undefined && value > 0);

    if (sfl !== undefined && quantities.length === 1) {
      return sfl / quantities[0];
    }
  }

  return undefined;
}

function listingResourceName(
  listing: ListingRecord,
  urlResource?: string,
): string | undefined {
  if (urlResource) {
    return urlResource;
  }

  if (typeof listing.resource === "string") {
    return listing.resource;
  }

  if (typeof listing.item === "string") {
    return listing.item;
  }

  if (typeof listing.name === "string") {
    return listing.name;
  }

  if (
    listing.items &&
    typeof listing.items === "object" &&
    listing.items !== null
  ) {
    const itemKeys = Object.keys(listing.items as Record<string, unknown>);
    if (itemKeys.length === 1) {
      return itemKeys[0];
    }
  }

  return undefined;
}

function medianPricesFromListings(
  listings: ListingRecord[],
  urlResource?: string,
): Partial<MarketPriceResponse> {
  const pricesByResource: Record<TargetResource, number[]> = {
    Wood: [],
    Stone: [],
  };

  for (const listing of listings) {
    const unitPrice = listingUnitPrice(listing);
    if (unitPrice === undefined) {
      continue;
    }

    const resourceName = listingResourceName(listing, urlResource);
    if (!resourceName) {
      continue;
    }

    if (resourceName === "Wood" || resourceName === "wood") {
      pricesByResource.Wood.push(unitPrice);
    }

    if (resourceName === "Stone" || resourceName === "stone") {
      pricesByResource.Stone.push(unitPrice);
    }
  }

  const result: Partial<MarketPriceResponse> = {};

  for (const resource of TARGET_RESOURCES) {
    const medianPrice = median(pricesByResource[resource]);
    if (medianPrice !== undefined) {
      result[resource] = medianPrice;
    }
  }

  return result;
}

function mergePrices(
  ...partials: Array<Partial<MarketPriceResponse> | null>
): Partial<MarketPriceResponse> {
  const merged: Partial<MarketPriceResponse> = {};

  for (const partial of partials) {
    if (!partial) {
      continue;
    }

    for (const resource of TARGET_RESOURCES) {
      if (merged[resource] === undefined && partial[resource] !== undefined) {
        merged[resource] = partial[resource];
      }
    }
  }

  return merged;
}

function isComplete(
  prices: Partial<MarketPriceResponse>,
): prices is MarketPriceResponse {
  return (
    prices.Wood !== undefined &&
    prices.Stone !== undefined &&
    Number.isFinite(prices.Wood) &&
    Number.isFinite(prices.Stone)
  );
}

async function fetchJson(url: string): Promise<{
  ok: boolean;
  status: number;
  data: unknown;
}> {
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  return { ok: response.ok, status: response.status, data };
}

function listingsBaseUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    parsed.search = "";
    return parsed.toString();
  } catch {
    return null;
  }
}

function listingsUrlForResource(
  baseUrl: string,
  resource: TargetResource,
): string {
  const url = new URL(baseUrl);
  url.searchParams.set("resource", resource);
  return url.toString();
}

async function tryRatesEndpoint(
  url: string,
): Promise<MarketPriceResponse | null> {
  const { ok, data } = await fetchJson(url);
  if (!ok) {
    return null;
  }

  const rates = extractRates(data);
  return rates && isComplete(rates) ? rates : null;
}

async function tryResourceListingsEndpoint(
  url: string,
): Promise<MarketPriceResponse | null> {
  const baseUrl = listingsBaseUrl(url);
  if (!baseUrl) {
    return null;
  }

  const partials: Array<Partial<MarketPriceResponse>> = [];

  for (const resource of TARGET_RESOURCES) {
    const fetchUrl = listingsUrlForResource(baseUrl, resource);
    const { ok, data } = await fetchJson(fetchUrl);
    if (!ok) {
      continue;
    }

    const listings = extractListings(data);
    partials.push(medianPricesFromListings(listings, resource));
  }

  const merged = mergePrices(...partials);
  return isComplete(merged) ? merged : null;
}

async function tryCommunityListingsEndpoint(
  url: string,
): Promise<MarketPriceResponse | null> {
  const { ok, data } = await fetchJson(url);
  if (!ok) {
    return null;
  }

  const prices = medianPricesFromListings(extractListings(data));
  return isComplete(prices) ? prices : null;
}

async function fetchMarketPrices(): Promise<MarketPriceResponse | null> {
  for (const endpoint of PUBLIC_ENDPOINTS) {
    if (endpoint.includes("/trades/rates")) {
      const rates = await tryRatesEndpoint(endpoint);
      if (rates) {
        return rates;
      }
      continue;
    }

    if (endpoint.includes("/marketplace/listings")) {
      const listings = await tryResourceListingsEndpoint(endpoint);
      if (listings) {
        return listings;
      }
      continue;
    }

    const community = await tryCommunityListingsEndpoint(endpoint);
    if (community) {
      return community;
    }
  }

  return null;
}

export const handler: Handler = async () => {
  try {
    const prices = await fetchMarketPrices();

    if (!prices) {
      return SERVICE_UNAVAILABLE;
    }

    return {
      statusCode: 200,
      headers: CACHE_HEADERS,
      body: JSON.stringify(prices),
    };
  } catch {
    return SERVICE_UNAVAILABLE;
  }
};
