import React from "react";
import { CROP_CONFIGS } from "../config/crops";
import type { CropKey, GlobalParams } from "../types";

export interface MarketPricesState {
  loading: boolean;
  error: string | null;
  isLive: boolean;
  lastUpdated?: string;
  fetchedAt?: Date;
  isPriceManuallyOverridden?: boolean;
  onPriceManualOverride?: () => void;
  onRefresh: () => void;
}

interface GlobalParamsPanelProps {
  params: GlobalParams;
  onChange: <K extends keyof GlobalParams>(
    key: K,
    value: GlobalParams[K],
  ) => void;
  marketPricesState?: MarketPricesState;
}

const COIN_FIELD = {
  key: "coinToFlowerRatio" as const,
  label: "Coin → Flower Ratio",
  hint: "Wie viele Coins entsprechen 1 FLW (für Tool-Kosten in Flower).",
  step: "1",
};

const MARKET_PRICE_FIELDS: {
  key: "marketPriceWood" | "marketPriceStone";
  label: string;
  hint: string;
  step: string;
}[] = [
  {
    key: "marketPriceWood",
    label: "Marktpreis Wood",
    hint: "FLW pro 1 Wood beim P2P-Verkauf (vor 10 % Gebühr).",
    step: "0.01",
  },
  {
    key: "marketPriceStone",
    label: "Marktpreis Stone",
    hint: "FLW pro 1 Stone beim P2P-Verkauf (vor 10 % Gebühr).",
    step: "0.01",
  },
];

function ParamField({
  label,
  hint,
  step,
  value,
  disabled,
  onChange,
}: {
  label: string;
  hint: string;
  step: string;
  value: number;
  disabled?: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium text-[#ead4aa]">{label}</span>
      <input
        type="number"
        min={0}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <span className="text-xs text-gray-400">{hint}</span>
    </label>
  );
}

function updateCropPrice(
  cropPrices: GlobalParams["cropPrices"],
  cropKey: CropKey,
  rawValue: string,
): GlobalParams["cropPrices"] {
  const next = { ...cropPrices };

  if (rawValue.trim() === "") {
    delete next[cropKey];
    return next;
  }

  const parsed = Number(rawValue);

  if (Number.isFinite(parsed) && parsed >= 0) {
    next[cropKey] = parsed;
  }

  return next;
}

export function GlobalParamsPanel({
  params,
  onChange,
  marketPricesState,
}: GlobalParamsPanelProps) {
  const pricesLoading = marketPricesState?.loading ?? false;
  const marketLoaded = marketPricesState !== undefined && !pricesLoading;
  const isPriceManuallyOverridden =
    marketPricesState?.isPriceManuallyOverridden ?? false;
  const fetchedAtLabel = marketPricesState?.fetchedAt?.toLocaleTimeString(
    "de-AT",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <section className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-[#ead4aa]">
        {"Globale Parameter"}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ParamField
          label={COIN_FIELD.label}
          hint={COIN_FIELD.hint}
          step={COIN_FIELD.step}
          value={params.coinToFlowerRatio}
          onChange={(value) => onChange("coinToFlowerRatio", value)}
        />
      </div>

      {marketPricesState && (
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-sm font-semibold text-[#ead4aa]">
              {"Marktpreise"}
            </h3>
            {pricesLoading && (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400"
                role="status"
                aria-label={"Marktpreise werden geladen"}
              />
            )}
            {marketLoaded && marketPricesState.isLive && (
              <span className="flex flex-col text-xs text-emerald-400/90">
                <span>{"✅ Live vom Markt"}</span>
                {fetchedAtLabel && (
                  <span className="text-gray-400">
                    {"Zuletzt geladen: "}
                    {fetchedAtLabel}
                    {" Uhr"}
                  </span>
                )}
              </span>
            )}
            {marketLoaded && !marketPricesState.isLive && (
              <span className="text-xs text-gray-400">
                {"📋 Fallback-Preise – Stand: "}
                {marketPricesState.lastUpdated ?? "unbekannt"}
              </span>
            )}
            <button
              type="button"
              onClick={marketPricesState.onRefresh}
              disabled={pricesLoading}
              aria-label={"Preise aktualisieren"}
              className="ml-auto rounded-lg border border-[#3e2731]/60 bg-transparent px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-[#3e2731] hover:text-[#ead4aa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {"🔄"}
            </button>
          </div>
          {marketPricesState.error && (
            <p className="text-xs text-amber-300" role="alert">
              {"⚠️ Marktpreise nicht erreichbar – Fallback aktiv"}
            </p>
          )}
          {isPriceManuallyOverridden && (
            <div className="flex flex-wrap items-center gap-2 text-xs text-amber-200">
              <span>{"🖊️ Manuell angepasst – Refresh setzt zurück"}</span>
              <button
                type="button"
                onClick={marketPricesState.onRefresh}
                disabled={pricesLoading}
                className="rounded border border-amber-400/30 px-2 py-1 text-amber-100 transition-colors hover:border-amber-300/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"Zurücksetzen"}
              </button>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {MARKET_PRICE_FIELDS.map(({ key, label, hint, step }) => (
              <ParamField
                key={key}
                label={label}
                hint={hint}
                step={step}
                value={params[key]}
                onChange={(value) => {
                  marketPricesState.onPriceManualOverride?.();
                  onChange(key, value);
                }}
              />
            ))}
          </div>
        </div>
      )}

      <details className="mt-4 rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a]/50 p-3">
        <summary className="cursor-pointer text-sm font-semibold text-[#ead4aa]">
          {"Crop-Marktpreise (manuell)"}
        </summary>
        <p className="mt-2 text-xs text-gray-400">
          {
            "Leere Felder zählen als kein Preis und bleiben in der Crop-Berechnung ausgeklammert."
          }
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CROP_CONFIGS.map((crop) => {
            const cropKey = crop.name;
            const value = params.cropPrices[cropKey];

            return (
              <label key={cropKey} className="flex flex-col gap-1">
                <span className="text-sm font-medium text-[#ead4aa]">
                  {crop.label}
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.0001"
                  placeholder="FLW/Crop"
                  value={value ?? ""}
                  onChange={(e) =>
                    onChange(
                      "cropPrices",
                      updateCropPrice(
                        params.cropPrices,
                        cropKey,
                        e.target.value,
                      ),
                    )
                  }
                  className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
                />
              </label>
            );
          })}
        </div>
      </details>

      {!marketPricesState && (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {MARKET_PRICE_FIELDS.map(({ key, label, hint, step }) => (
            <ParamField
              key={key}
              label={label}
              hint={hint}
              step={step}
              value={params[key]}
              onChange={(value) => onChange(key, value)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
