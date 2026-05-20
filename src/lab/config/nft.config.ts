import type { NftBoost } from "../types";
import type { NftAsset, NftSimulationParams } from "../types";
import { getPrimaryBoostEffect } from "../utils/boosts";

/** Default simulation parameters for the NFT simulator tab */
export const NFT_DEFAULT_PARAMS: Readonly<NftSimulationParams> = {
  enabled: true,
};

/**
 * Static NFT metadata overlay (empty in V1 – assets are derived from boosts at runtime).
 * Extend when assets need config beyond BOOSTS.
 */
export const NFT_ASSETS: readonly NftAsset[] = [];

export function boostToNftAsset(boost: NftBoost): NftAsset {
  const effect = getPrimaryBoostEffect(boost);

  return {
    key: boost.id,
    label: boost.label,
    basePrice: boost.priceFlw,
    type: boost.type,
    owned: boost.owned,
    resource: effect.resource,
    boostType: effect.effectType,
    effectValue: effect.value,
  };
}
