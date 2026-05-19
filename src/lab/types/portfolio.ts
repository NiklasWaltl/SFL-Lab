// SFL-Lab – Portfolio-Typen
// Ausschließlich für den Portfolio-Tab, sauber getrennt von anderen Typen

export interface PortfolioPosition {
  id: string;
  label: string;
  source: "nft" | "skill";
  affectsResource: string;
  /** Kaufpreis in FLW (manuell eingetragen oder aus boost.priceFlw) */
  purchasePriceFlw: number | null;
  /** Aktueller Marktwert in FLW (editierbar) */
  currentValueFlw: number | null;
  /** Täglicher Mehrwert in FLW durch diesen Boost (berechnet) */
  dailyValueFlw: number;
  /** Break-even in Tagen (null wenn nicht berechenbar) */
  breakEvenDays: number | null;
  /** ROI in % (null wenn nicht berechenbar) */
  roiPercent: number | null;
  /** Tage seit Kauf (null wenn nicht gesetzt) */
  daysSincePurchase: number | null;
  /** Bereits erwirtschafteter Wert (daysSincePurchase * dailyValueFlw) */
  earnedSoPurchaseFlw: number | null;
  owned: boolean;
}
