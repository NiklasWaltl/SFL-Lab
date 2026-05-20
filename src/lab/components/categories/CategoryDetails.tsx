import React from "react";
import type {
  CategoryDetailContext,
  CategoryValue,
  ResourceResult,
} from "../../types";
import {
  getBoostDetailLines,
  getCostDetailLines,
  getNetDetailLines,
  getResourceDetailLines,
} from "../../utils/categoryBreakdown";
import { deltaColorClass, formatDelta, formatNumber } from "../../utils/format";

interface CategoryDetailsProps {
  category: CategoryValue;
  detailContext: CategoryDetailContext;
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  allCategories: CategoryValue[];
  isExperimentView: boolean;
}

const PLACEHOLDER_KEYS = new Set(["crops", "animals", "crafting", "trading"]);

export function CategoryDetails({
  category,
  detailContext,
  actualResults,
  experimentResults,
  allCategories,
  isExperimentView,
}: CategoryDetailsProps) {
  if (PLACEHOLDER_KEYS.has(category.key)) {
    return (
      <div className="mt-3 rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a]/60 p-4">
        <p className="text-sm text-gray-400">{"Noch nicht berechnet"}</p>
        {category.description && (
          <p className="mt-2 text-xs text-gray-500">{category.description}</p>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-lg border border-[#3e2731]/40 bg-[#0f0d1a]/60 p-4">
      {category.key === "resources" && (
        <ResourceDetails
          actualResults={actualResults}
          experimentResults={experimentResults}
          resources={detailContext.resources}
          isExperimentView={isExperimentView}
        />
      )}
      {category.key === "boosts" && (
        <BoostDetails
          detailContext={detailContext}
          isExperimentView={isExperimentView}
        />
      )}
      {category.key === "costs" && (
        <CostDetails
          actualResults={actualResults}
          experimentResults={experimentResults}
          globalParams={detailContext.globalParams}
          resources={detailContext.resources}
          isExperimentView={isExperimentView}
        />
      )}
      {category.key === "net" && (
        <NetDetails
          categories={allCategories}
          isExperimentView={isExperimentView}
        />
      )}
    </div>
  );
}

function ResourceDetails({
  actualResults,
  experimentResults,
  resources,
  isExperimentView,
}: {
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  resources: CategoryDetailContext["resources"];
  isExperimentView: boolean;
}) {
  const lines = getResourceDetailLines(
    actualResults,
    experimentResults,
    resources,
  );

  return (
    <DetailList title="Wood & Stone">
      {lines.map((line) => (
        <DetailRow
          key={line.resourceId}
          label={line.label}
          actual={line.actual}
          experiment={line.experiment}
          delta={line.delta}
          isExperimentView={isExperimentView}
        />
      ))}
    </DetailList>
  );
}

function BoostDetails({
  detailContext,
  isExperimentView,
}: {
  detailContext: CategoryDetailContext;
  isExperimentView: boolean;
}) {
  const lines = getBoostDetailLines(
    detailContext.resources,
    detailContext.globalParams,
    detailContext.actualActiveBoosts,
    detailContext.experimentActiveBoosts,
  ).filter((line) => isExperimentView || line.marginalActual !== null);

  if (lines.length === 0) {
    return <p className="text-sm text-gray-400">{"Keine aktiven Boosts"}</p>;
  }

  return (
    <div>
      <p className="mb-3 text-xs text-gray-500">
        {"Marginaler Gewinnbeitrag pro Boost (nicht additiv zum Netto-Gewinn)"}
      </p>
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <li
            key={line.boost.id}
            className="flex flex-col gap-1 rounded-lg border border-[#3e2731]/40 p-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#ead4aa]">{line.boost.label}</span>
              <span
                className={`rounded px-1.5 py-0.5 text-xs uppercase ${
                  line.boost.type === "NFT"
                    ? "bg-purple-500/20 text-purple-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}
              >
                {line.boost.type}
              </span>
              {isExperimentView && line.isExperimentOnly && (
                <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs text-amber-300">
                  {"Experiment"}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-300">
              {line.marginalActual !== null && (
                <span>
                  {"Ist: "}
                  {formatNumber(line.marginalActual)}
                  {" FLW/Tag"}
                </span>
              )}
              {isExperimentView && line.marginalExperiment !== null && (
                <span className={line.marginalActual !== null ? " ml-3" : ""}>
                  {"Exp: "}
                  {formatNumber(line.marginalExperiment)}
                  {" FLW/Tag"}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CostDetails({
  actualResults,
  experimentResults,
  globalParams,
  resources,
  isExperimentView,
}: {
  actualResults: ResourceResult[];
  experimentResults: ResourceResult[];
  globalParams: CategoryDetailContext["globalParams"];
  resources: CategoryDetailContext["resources"];
  isExperimentView: boolean;
}) {
  const actualLines = getCostDetailLines(
    actualResults,
    globalParams,
    resources,
  );
  const experimentLines = isExperimentView
    ? getCostDetailLines(experimentResults, globalParams, resources)
    : [];

  return (
    <DetailList title="Kostentreiber">
      {actualLines.map((line, i) => {
        const expLine = experimentLines[i];
        return (
          <li
            key={line.resourceId}
            className="rounded-lg border border-[#3e2731]/30 p-3"
          >
            <p className="font-medium text-[#ead4aa]">{line.label}</p>
            <p className="mt-1 text-sm text-gray-400">
              {"Coin (FLW): "}
              {formatNumber(line.coinCostFlw)}
              {" · FLW direkt: "}
              {formatNumber(line.flwCostPerDay)}
              {line.woodCostPerDay !== undefined && (
                <>
                  {" · Wood/Tag: "}
                  {formatNumber(line.woodCostPerDay)}
                </>
              )}
            </p>
            <p className="mt-1 text-sm text-gray-300">
              {"Ist gesamt: "}
              {formatNumber(line.total)}
              {" FLW/Tag"}
              {isExperimentView && (
                <>
                  {" · Experiment: "}
                  {formatNumber(expLine?.total ?? 0)}
                  {" FLW/Tag"}
                </>
              )}
            </p>
          </li>
        );
      })}
    </DetailList>
  );
}

function NetDetails({
  categories,
  isExperimentView,
}: {
  categories: CategoryValue[];
  isExperimentView: boolean;
}) {
  const lines = getNetDetailLines(categories);

  return (
    <div>
      <p className="mb-3 text-xs text-gray-500">
        {
          "Netto entspricht dem P2P-Gewinn aller Ressourcen. Boost-Zeile zeigt marginale Attribution."
        }
      </p>
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <li key={line.key} className="flex justify-between gap-2 text-sm">
            <span className="text-gray-400">
              {line.label}
              {line.status === "placeholder" && (
                <span className="ml-2 text-xs text-gray-500">
                  {"(Platzhalter)"}
                </span>
              )}
            </span>
            <span className="text-[#ead4aa]">
              {formatNumber(line.actual)}
              {" FLW/Tag"}
              {isExperimentView && (
                <>
                  {" / "}
                  {formatNumber(line.experiment)}
                  {" FLW/Tag"}
                </>
              )}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function DetailList({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function DetailRow({
  label,
  actual,
  experiment,
  delta,
  isExperimentView,
}: {
  label: string;
  actual: number;
  experiment: number;
  delta: number;
  isExperimentView: boolean;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <span className="text-[#ead4aa]">{label}</span>
      <span className="text-gray-300">
        {formatNumber(actual)}
        {" FLW/Tag"}
        {isExperimentView && (
          <>
            {" / "}
            {formatNumber(experiment)}
            {" FLW/Tag · "}
            <span className={deltaColorClass(delta)}>{formatDelta(delta)}</span>
          </>
        )}
      </span>
    </li>
  );
}
