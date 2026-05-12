/** Normalize floats used in SVG attributes so SSR HTML matches hydrated client markup. */
export function svgCoords(n: number, decimals = 4): number {
  return Number.parseFloat(n.toFixed(decimals));
}

/** Round every numeric token in an SVG path `d` attribute (for d3-shape / trig output). */
export function normalizeSvgPathD(
  d: string | undefined,
  decimals = 4,
): string | undefined {
  if (!d) return d;
  return d.replace(/-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/gi, (match) => {
    const parsed = Number.parseFloat(match);
    if (!Number.isFinite(parsed)) return match;
    return String(Number.parseFloat(parsed.toFixed(decimals)));
  });
}
