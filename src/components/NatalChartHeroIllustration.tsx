/** Decorative natal-wheel — use variant="background" behind hero text (no layout space). */
export function NatalChartHeroIllustration({
  className = "",
  variant = "default",
}: {
  className?: string;
  variant?: "default" | "background";
}) {
  const cx = 100;
  const cy = 100;
  const rOuter = 88;
  const rInner = 52;
  const signs = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];
  const gradId =
    variant === "background" ? "heroWheelGradBg" : "heroWheelGrad";

  return (
    <div className={["relative select-none", className].join(" ")} aria-hidden>
      {variant === "default" ? (
        <div className="absolute inset-0 rounded-full bg-violet-500/15 blur-2xl" />
      ) : null}
      <svg
        viewBox="0 0 200 200"
        className={[
          "relative h-full w-full",
          variant === "background"
            ? "opacity-95 drop-shadow-[0_0_40px_rgba(139,92,246,0.25)]"
            : "drop-shadow-[0_0_28px_rgba(167,139,250,0.35)]",
        ].join(" ")}
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(196, 181, 254, 0.45)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
          </linearGradient>
        </defs>
        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 6}
          fill="rgba(0,0,0,0.2)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />
        {signs.map((sym, i) => {
          const a0 = ((i * 30 - 90) * Math.PI) / 180;
          const a1 = (((i + 1) * 30 - 90) * Math.PI) / 180;
          const x1 = cx + rInner * Math.cos(a0);
          const y1 = cy + rInner * Math.sin(a0);
          const x2 = cx + rOuter * Math.cos(a0);
          const y2 = cy + rOuter * Math.sin(a0);
          const x3 = cx + rOuter * Math.cos(a1);
          const y3 = cy + rOuter * Math.sin(a1);
          const x4 = cx + rInner * Math.cos(a1);
          const y4 = cy + rInner * Math.sin(a1);
          const mid = ((i + 0.5) * 30 - 90) * (Math.PI / 180);
          const lx = cx + ((rInner + rOuter) / 2) * Math.cos(mid);
          const ly = cy + ((rInner + rOuter) / 2) * Math.sin(mid);
          return (
            <g key={sym}>
              <path
                d={`M ${x1} ${y1} L ${x2} ${y2} A ${rOuter} ${rOuter} 0 0 1 ${x3} ${y3} L ${x4} ${y4} A ${rInner} ${rInner} 0 0 0 ${x1} ${y1} Z`}
                fill={
                  i % 2 === 0
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(139, 92, 246, 0.12)"
                }
                stroke="rgba(255,255,255,0.12)"
                strokeWidth={0.5}
              />
              <text
                x={lx}
                y={ly}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(255,255,255,0.88)"
                style={{ fontSize: 13 }}
              >
                {sym}
              </text>
            </g>
          );
        })}
        <circle
          cx={cx}
          cy={cy}
          r={rInner - 4}
          fill={`url(#${gradId})`}
          stroke="rgba(216, 180, 254, 0.45)"
          strokeWidth={1.2}
        />
        <line
          x1={cx}
          y1={cy}
          x2={cx - rOuter - 2}
          y2={cy}
          stroke="rgba(251, 191, 36, 0.9)"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
        {[
          { x: cx + 28, y: cy - 18, t: "☉" },
          { x: cx - 22, y: cy + 24, t: "☽" },
          { x: cx + 12, y: cy + 8, t: "♀" },
        ].map((p) => (
          <text
            key={p.t}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill="rgba(250, 250, 250, 0.95)"
            style={{ fontSize: 14 }}
          >
            {p.t}
          </text>
        ))}
        <circle cx={cx} cy={cy} r={4} fill="rgba(255,255,255,0.95)" />
      </svg>
    </div>
  );
}
