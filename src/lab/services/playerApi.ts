import type { PlayerData } from "../types";

const DEFAULT_API_URL = "https://api-dev.sunflower-land.com";
const DEFAULT_PORTAL_ID = "sfl-lab";

export function getJwtFromUrl(): string | null {
  return new URLSearchParams(window.location.search).get("jwt");
}

export function getFarmIdFromUrl(): number | null {
  const farmId = new URLSearchParams(window.location.search).get("farmId");
  if (!farmId) return null;

  const parsedFarmId = Number(farmId);
  return Number.isFinite(parsedFarmId) ? parsedFarmId : null;
}

export function getApiUrl(): string {
  const network = new URLSearchParams(window.location.search).get("network");

  if (network === "mainnet") {
    return "https://api.sunflower-land.com";
  }

  if (network) {
    return "https://api-dev.sunflower-land.com";
  }

  return import.meta.env.VITE_API_URL ?? DEFAULT_API_URL;
}

function getPortalId(): string {
  return import.meta.env.VITE_PORTAL_APP ?? DEFAULT_PORTAL_ID;
}

export function parseInventoryAmount(value: unknown): string {
  if (value === null || value === undefined) return "0";
  if (typeof value === "object" && value !== null && "toString" in value) {
    return String((value as { toString: () => string }).toString());
  }
  return String(value);
}

function extractRecordKeys(
  data: Record<string, unknown> | undefined,
): string[] {
  if (!data) return [];

  return Object.entries(data)
    .filter(([, items]) => {
      if (Array.isArray(items)) return items.length > 0;
      if (items && typeof items === "object") return true;
      return Boolean(items);
    })
    .map(([name]) => name);
}

function parseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

/** Mappt Portal-API-Response ({ farm }) auf PlayerData */
export function mapPortalResponse(raw: unknown): PlayerData {
  const root = raw as Record<string, unknown>;
  const farm = (root.farm ?? root) as Record<string, unknown>;

  const farmId =
    parseNumber(farm.farmId) ??
    parseNumber(root.farmId) ??
    parseNumber(root.id) ??
    0;

  const rawInventory = (farm.inventory ?? {}) as Record<string, unknown>;
  const inventory: Record<string, string> = {};
  for (const [key, value] of Object.entries(rawInventory)) {
    inventory[key] = parseInventoryAmount(value);
  }

  const bumpkinRaw = farm.bumpkin as Record<string, unknown> | undefined;
  const bumpkin = bumpkinRaw
    ? {
        experience:
          typeof bumpkinRaw.experience === "number"
            ? bumpkinRaw.experience
            : parseFloat(String(bumpkinRaw.experience ?? 0)) || 0,
        equipped: bumpkinRaw.equipped as Record<string, string> | undefined,
        skills: bumpkinRaw.skills as
          | Record<string, number | boolean>
          | undefined,
      }
    : undefined;

  const home = farm.home as Record<string, unknown> | undefined;
  const collectiblesSource =
    (farm.collectibles as Record<string, unknown[]>) ??
    (home?.collectibles as Record<string, unknown[]>) ??
    {};

  const buildingsSource = (farm.buildings as Record<string, unknown[]>) ?? {};

  return {
    farmId,
    nftId: typeof root.nft_id === "number" ? root.nft_id : undefined,
    balance: typeof farm.balance === "string" ? farm.balance : undefined,
    coins: typeof farm.coins === "number" ? farm.coins : undefined,
    bumpkin,
    resources: {
      trees:
        farm.trees && typeof farm.trees === "object"
          ? Object.keys(farm.trees as object).length
          : undefined,
      stones:
        farm.stones && typeof farm.stones === "object"
          ? Object.keys(farm.stones as object).length
          : undefined,
      iron:
        farm.iron && typeof farm.iron === "object"
          ? Object.keys(farm.iron as object).length
          : undefined,
      gold:
        farm.gold && typeof farm.gold === "object"
          ? Object.keys(farm.gold as object).length
          : undefined,
      crops:
        farm.crops && typeof farm.crops === "object"
          ? Object.keys(farm.crops as object).length
          : undefined,
      fruitPatches:
        farm.fruitPatches && typeof farm.fruitPatches === "object"
          ? Object.keys(farm.fruitPatches as object).length
          : undefined,
      chickens:
        farm.chickens && typeof farm.chickens === "object"
          ? Object.keys(farm.chickens as object).length
          : undefined,
    },
    inventory,
    buildings: buildingsSource,
    collectibles: collectiblesSource,
  };
}

export async function fetchPlayerData(jwt: string): Promise<PlayerData> {
  const baseUrl = getApiUrl();
  const portalId = getPortalId();

  const res = await fetch(`${baseUrl}/portal/${portalId}/player`, {
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data: unknown = await res.json();
  return mapPortalResponse(data);
}

function parseJsonResponse(text: string, contentType: string): unknown {
  const isJson =
    contentType.includes("application/json") || text.trim().startsWith("{");

  if (!isJson) {
    throw new Error(
      "Server antwortete mit HTML statt JSON. Dev: `yarn dev:lab` neu starten (Proxy /api/farm). Deploy: `netlify dev` oder Netlify-Redirect prüfen.",
    );
  }

  return JSON.parse(text) as unknown;
}

export async function fetchPublicFarmData(
  farmId: number,
  apiKey: string,
): Promise<PlayerData> {
  const res = await fetch(`/api/farm/${farmId}`, {
    headers: {
      Accept: "application/json",
      "x-api-key": apiKey,
    },
  });

  const text = await res.text();
  const contentType = res.headers.get("content-type") ?? "";

  if (!res.ok) {
    let message = `API error: ${res.status}`;
    try {
      const errBody = parseJsonResponse(text, contentType) as {
        error?: string;
      };
      if (typeof errBody.error === "string") {
        message = errBody.error;
      }
    } catch {
      // Non-JSON error body (e.g. HTML from missing proxy).
    }
    throw new Error(message);
  }

  const data = parseJsonResponse(text, contentType);
  return mapPortalResponse(data);
}

export function getMockPlayerData(): PlayerData {
  return {
    farmId: 7762677082636687,
    nftId: 12345,
    balance: "42.5",
    coins: 5000,
    resources: {
      trees: 8,
      stones: 6,
      iron: 3,
      gold: 1,
      crops: 10,
      fruitPatches: 4,
      chickens: 5,
    },
    inventory: {
      Wood: "530.4",
      Stone: "330",
      Flower: "100",
      Coin: "10000",
    },
  };
}

/** Namen besessener Collectibles/Buildings für NormalizedFarm */
export function getCollectibleNames(data: PlayerData): string[] {
  return extractRecordKeys(
    data.collectibles as Record<string, unknown> | undefined,
  );
}

export function getBuildingNames(data: PlayerData): string[] {
  return extractRecordKeys(
    data.buildings as Record<string, unknown> | undefined,
  );
}
