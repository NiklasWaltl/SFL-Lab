import React, { useState } from "react";

interface FarmIdInputProps {
  farmId: number | null;
  onSubmit: (id: number) => void;
  onClear: () => void;
}

export function FarmIdInput({ farmId, onSubmit, onClear }: FarmIdInputProps) {
  const [value, setValue] = useState("");
  const parsedFarmId = Number(value);
  const isValidFarmId = Number.isFinite(parsedFarmId) && parsedFarmId > 0;

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!isValidFarmId) return;

    onSubmit(parsedFarmId);
  }

  function handleClear() {
    setValue("");
    onClear();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#ead4aa]">
            {"Farm-ID"}
          </span>
          <input
            type="number"
            min={1}
            value={value}
            placeholder={"Farm-ID eingeben…"}
            onChange={(event) => setValue(event.target.value)}
            className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </label>

        {farmId && (
          <p className="text-sm text-emerald-400">
            {"Farm #"}
            {farmId}
            {" aktiv"}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={!isValidFarmId}
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-[#181425] hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-amber-500"
          >
            {"Laden"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-lg border border-[#3e2731]/60 px-3 py-2 text-sm font-semibold text-[#ead4aa] hover:border-amber-500/60"
          >
            {"Entfernen"}
          </button>
        </div>
      </div>
    </form>
  );
}
