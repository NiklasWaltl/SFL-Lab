export type MarketPriceMap = Record<string, number>;

export interface MarketPricesResponse {
  prices: MarketPriceMap;
  isLive: boolean;
  lastUpdated?: string;
  errorMessage?: string;
}
