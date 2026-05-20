import React from "react";
import type { GlobalParams } from "../types";

export interface MarketPricesState {
  loading: boolean;
  error: string | null;
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

export function GlobalParamsPanel({
  params,
  onChange,
  marketPricesState,
}: GlobalParamsPanelProps) {
  const pricesLoading = marketPricesState?.loading ?? false;
  const pricesError = marketPricesState?.error ?? null;
  const marketInputsDisabled = pricesLoading && !pricesError;
  const marketLoaded =
    marketPricesState !== undefined && !pricesLoading && !pricesError;

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
            {pricesLoading && !pricesError && (
              <span
                className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400"
                role="status"
                aria-label={"Marktpreise werden geladen"}
              />
            )}
            {marketLoaded && (
              <span className="text-xs text-emerald-400/90">
                {"Live vom Markt"}
              </span>
            )}
            <button
              type="button"
              onClick={marketPricesState.onRefresh}
              disabled={pricesLoading}
              className="ml-auto rounded-lg border border-[#3e2731]/60 bg-transparent px-3 py-1.5 text-sm text-gray-400 transition-colors hover:border-[#3e2731] hover:text-[#ead4aa] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {"🔄 Preise aktualisieren"}
            </button>
          </div>

          {pricesError && (
            <p
              className="rounded-lg border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              role="alert"
            >
              {pricesError}
              {" – Manuelle Eingabe wird verwendet."}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            {MARKET_PRICE_FIELDS.map(({ key, label, hint, step }) => (
              <ParamField
                key={key}
                label={label}
                hint={hint}
                step={step}
                value={params[key]}
                disabled={marketInputsDisabled}
                onChange={(value) => onChange(key, value)}
              />
            ))}
          </div>
        </div>
      )}

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
