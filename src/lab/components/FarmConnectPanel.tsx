import React, { useState } from "react";

interface FarmConnectPanelProps {
  farmId: number | null;
  apiKey: string | null;
  onSubmit: (farmId: number, apiKey: string) => void;
  onClear: () => void;
}

export function FarmConnectPanel({
  farmId,
  apiKey,
  onSubmit,
  onClear,
}: FarmConnectPanelProps) {
  const [farmIdValue, setFarmIdValue] = useState("");
  const [apiKeyValue, setApiKeyValue] = useState("");
  const parsedFarmId = Number(farmIdValue);
  const isValidFarmId = Number.isFinite(parsedFarmId) && parsedFarmId > 0;
  const isValidApiKey = apiKeyValue.trim().length > 0;
  const canConnect = isValidFarmId && isValidApiKey;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canConnect) return;

    onSubmit(parsedFarmId, apiKeyValue.trim());
  }

  function handleClear() {
    setFarmIdValue("");
    setApiKeyValue("");
    onClear();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[#ead4aa]">
              {"Farm-ID"}
            </span>
            <input
              type="number"
              min={1}
              value={farmIdValue}
              placeholder={"Farm-ID"}
              onChange={(event) => setFarmIdValue(event.target.value)}
              className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-[#ead4aa]">
              {"API Key"}
            </span>
            <input
              type="password"
              value={apiKeyValue}
              placeholder={"API Key (Spiel → Einstellungen → API Key)"}
              onChange={(event) => setApiKeyValue(event.target.value)}
              className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
            />
          </label>
        </div>

        {farmId && apiKey && (
          <p className="text-sm text-emerald-400">
            {"Farm #"}
            {farmId}
            {" verbunden"}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!canConnect}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-[#181425] hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-amber-500"
          >
            {"Verbinden"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-[#3e2731]/60 px-3 py-2 text-sm font-semibold text-[#ead4aa] hover:border-amber-500/60"
          >
            {"Trennen"}
          </button>
        </div>
      </div>
    </form>
  );
}
