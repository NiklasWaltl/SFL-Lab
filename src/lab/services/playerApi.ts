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

/** Mappt Portal-API-Response ({ farm }) auf PlayerData */
export function mapPortalResponse(raw: unknown): PlayerData {
  const root = raw as Record<string, unknown>;
  const farm = (root.farm ?? root) as Record<string, unknown>;

  const farmId =
    typeof farm.farmId === "number"
      ? farm.farmId
      : typeof root.farmId === "number"
        ? root.farmId
        : 0;

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
    bumpkin,
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

export async function fetchPublicFarmData(farmId: number): Promise<PlayerData> {
  const res = await fetch(
    `https://api.sunflower-land.com/community/farms/${farmId}`,
  );

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }

  const data: unknown = await res.json();
  return mapPortalResponse(data);
}

export function getMockPlayerData(): PlayerData {
  return {
    farmId: 7762677082636687,
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
