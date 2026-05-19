import React from "react";

export type TabId =
  | "overview"
  | "categories"
  | "nft-simulator"
  | "portfolio"
  | "scenarios";

export const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Übersicht" },
  { id: "categories", label: "Kategorien" },
  { id: "nft-simulator", label: "NFT-Simulator" },
  { id: "portfolio", label: "Portfolio" },
  { id: "scenarios", label: "Szenarien" },
];

interface LabTabNavProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function LabTabNav({ activeTab, onTabChange }: LabTabNavProps) {
  return (
    <nav
      className="flex flex-wrap gap-1 border-b border-[#3e2731]/40 pb-1"
      aria-label="Lab Navigation"
    >
      {TABS.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onTabChange(tab.id)}
          className={`rounded-t-lg px-3 py-2 text-sm font-medium transition-colors sm:px-4 ${
            activeTab === tab.id
              ? "border border-b-0 border-amber-500/60 bg-[#181425] text-amber-300"
              : "text-gray-400 hover:text-[#ead4aa]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
