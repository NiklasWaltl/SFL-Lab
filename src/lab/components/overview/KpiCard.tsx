import React from "react";
import { deltaColorClass, formatDelta, formatNumber } from "../../utils/format";

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  color?: string;
  title?: string;
}

export function KpiCard({
  label,
  value,
  unit,
  delta,
  deltaLabel,
  color,
  title,
}: KpiCardProps) {
  const displayValue = typeof value === "number" ? formatNumber(value) : value;

  return (
    <article
      className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
      title={title}
    >
      <p
        className={`text-xs font-medium uppercase tracking-wide text-gray-500 ${color ?? ""}`}
      >
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-[#ead4aa]">
        {displayValue}
        {unit && (
          <span className="ml-1 text-sm font-normal text-gray-400">{unit}</span>
        )}
      </p>
      {delta !== undefined && (
        <p className={`mt-1 text-sm ${deltaColorClass(delta)}`}>
          {deltaLabel ? `${deltaLabel}: ` : ""}
          {formatDelta(delta)}
          {unit ? ` ${unit}` : ""}
        </p>
      )}
    </article>
  );
}
