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

/** Tailwind-Klasse für Delta-Farbe */
export function deltaColorClass(n: number): string {
  if (n > 0) return "text-green-400";
  if (n < 0) return "text-red-400";
  return "text-gray-400";
}
