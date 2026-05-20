import React from "react";
import type { CategoryValue } from "../../types";
import { deltaColorClass, formatDelta, formatNumber } from "../../utils/format";

interface CategoryCardProps {
  category: CategoryValue;
  isExperimentView: boolean;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

const STATUS_LABELS: Record<CategoryValue["status"], string> = {
  calculated: "Berechnet",
  partial: "Teilweise",
  placeholder: "Platzhalter",
};

const STATUS_BADGE_CLASS: Record<CategoryValue["status"], string> = {
  calculated: "bg-green-500/20 text-green-300",
  partial: "bg-amber-500/20 text-amber-300",
  placeholder: "bg-[#3e2731]/60 text-gray-400",
};

export function CategoryCard({
  category,
  isExperimentView,
  expanded = false,
  onToggleExpand,
}: CategoryCardProps) {
  const isPlaceholder = category.status === "placeholder";

  return (
    <article
      className={`rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg ${
        isPlaceholder ? "opacity-75" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-base font-semibold text-[#ead4aa]">
            {category.label}
          </h3>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_BADGE_CLASS[category.status]}`}
          >
            {STATUS_LABELS[category.status]}
          </span>
        </div>
        {onToggleExpand && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-expanded={expanded}
            className="shrink-0 rounded-lg border border-[#3e2731]/50 px-2 py-1 text-xs text-gray-400 transition-colors hover:border-[#3e2731] hover:text-[#ead4aa]"
          >
            {expanded ? "▲" : "▼"}
          </button>
        )}
      </div>

      <div
        className={`mt-4 grid gap-2 text-center sm:gap-4 ${
          isExperimentView ? "grid-cols-3" : "grid-cols-1"
        }`}
      >
        <ValueColumn label="Ist" value={category.actual} />
        {isExperimentView && (
          <ValueColumn label="Experiment" value={category.experiment} />
        )}
        {isExperimentView && (
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">
              {"Delta"}
            </p>
            <p
              className={`mt-1 text-sm font-semibold sm:text-base ${deltaColorClass(category.delta)}`}
            >
              {formatDelta(category.delta)}
            </p>
            <p className="text-xs text-gray-500">{"FLW/Tag"}</p>
          </div>
        )}
      </div>

      {category.shareOfTotal !== undefined && (
        <p className="mt-3 text-sm text-gray-400">
          {`${formatNumber(category.shareOfTotal)} % vom Gesamtgewinn`}
        </p>
      )}

      {category.description && (
        <p className="mt-2 text-sm text-gray-400">{category.description}</p>
      )}
    </article>
  );
}

function ValueColumn({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[#ead4aa] sm:text-base">
        {formatNumber(value)}
      </p>
      <p className="text-xs text-gray-500">{"FLW/Tag"}</p>
    </div>
  );
}
