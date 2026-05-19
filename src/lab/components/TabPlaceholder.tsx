import React from "react";

interface TabPlaceholderProps {
  label: string;
}

export function TabPlaceholder({ label }: TabPlaceholderProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-xl border border-dashed border-[#3e2731]/50 bg-[#181425]/50 p-8 text-center">
      <p className="text-lg font-medium text-[#ead4aa]">{label}</p>
      <p className="mt-2 text-sm text-gray-500">{"Bald verfügbar"}</p>
    </div>
  );
}
