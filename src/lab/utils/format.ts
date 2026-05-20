/** Zahlenformat mit 2 Dezimalstellen */
export function formatNumber(n: number): string {
  return n.toFixed(2);
}

/** Delta mit Vorzeichen (+/-) */
export function formatDelta(n: number): string {
  if (n > 0) return `+${formatNumber(n)}`;
  if (n < 0) return `-${formatNumber(Math.abs(n))}`;
  return formatNumber(0);
}

/** Lesbare Break-even-Dauer */
export function formatBreakEven(days: number | null): string {
  if (days === null || !Number.isFinite(days) || days <= 0) return "—";
  if (days <= 1) return "< 1 Tag";
  if (days < 7) return `${days} Tage`;
  if (days < 30) return `~${Math.round(days / 7)} Wochen`;
  if (days < 365) return `~${Math.round(days / 30)} Monate`;
  return `~${Math.round(days / 365)} Jahre`;
}

/** Tailwind-Klasse für Delta-Farbe */
export function deltaColorClass(n: number): string {
  if (n > 0) return "text-green-400";
  if (n < 0) return "text-red-400";
  return "text-gray-400";
}
