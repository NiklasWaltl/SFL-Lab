import React, { useState } from "react";

interface JwtInputProps {
  jwt: string | null;
  onSubmit: (token: string) => void;
  onClear: () => void;
}

export function JwtInput({ jwt, onSubmit, onClear }: JwtInputProps) {
  const [token, setToken] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(token);
  }

  function handleClear() {
    setToken("");
    onClear();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-[#3e2731]/40 bg-[#181425] p-4 shadow-lg"
    >
      <div className="flex flex-col gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-[#ead4aa]">{"JWT"}</span>
          <input
            type="password"
            value={token}
            onChange={(event) => setToken(event.target.value)}
            className="rounded-lg border border-[#3e2731]/60 bg-[#0f0d1a] px-3 py-2 text-sm text-white focus:border-amber-500/60 focus:outline-none focus:ring-1 focus:ring-amber-500/40"
          />
        </label>

        {jwt && (
          <p className="text-sm text-emerald-400">
            {"Farm-Daten aktiv (JWT gespeichert)"}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-semibold text-[#181425] hover:bg-amber-400"
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
