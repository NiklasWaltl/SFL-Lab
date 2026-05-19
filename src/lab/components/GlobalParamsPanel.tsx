import React from "react";
import type { GlobalParams } from "../types";

interface GlobalParamsPanelProps {
  params: GlobalParams;
  onChange: <K extends keyof GlobalParams>(
    key: K,
    value: GlobalParams[K],
  ) => void;
}

const FIELDS: {
  key: keyof GlobalParams;
  label: string;
  hint: string;
  step?: string;
}[] = [
  {
    key: "coinToFlowerRatio",
    label: "Coin → Flower Ratio",
    hint: "Wie viele Coins entsprechen 1 FLW (für Tool-Kosten in Flower).",
    step: "1",
  },
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

export function GlobalParamsPanel({
  params,
  onChange,
}: GlobalParamsPanelProps) {
  return (
    <section className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg">
      <h2 className="mb-4 text-lg font-semibold text-[#ead4aa]">
        {"Globale Parameter"}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FIELDS.map(({ key, label, hint, step }) => (
          <label key={key} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[#ead4aa]">{label}</span>
            <input
              type="number"
              min={0}
              step={step ?? "any"}
              value={params[key]}
              onChange={(e) => onChange(key, parseFloat(e.target.value) || 0)}
              className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
            <span className="text-xs text-gray-400">{hint}</span>
          </label>
        ))}
      </div>
    </section>
  );
}
