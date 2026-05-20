import type { Boost } from "../types";
import type { NftAsset, NftSimulationParams } from "../types";

/** Default simulation parameters for the NFT simulator tab */
export const NFT_DEFAULT_PARAMS: Readonly<NftSimulationParams> = {
  enabled: true,
};

/**
 * Static NFT metadata overlay (empty in V1 – assets are derived from boosts at runtime).
 * Extend when assets need config beyond BOOSTS.
 */
export const NFT_ASSETS: readonly NftAsset[] = [];

export function boostToNftAsset(boost: Boost): NftAsset {
  return {
    key: boost.id,
    label: boost.label,
    basePrice: boost.priceFlw,
    source: boost.source,
    owned: boost.owned,
    affectsResource: boost.affectsResource,
    boostType: boost.type,
    effectValue: boost.value,
  };
}
