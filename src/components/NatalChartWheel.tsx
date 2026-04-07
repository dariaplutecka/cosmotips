"use client";

import type { AppLang } from "@/lib/reportSchema";
import type { NatalChartPayload } from "@/lib/natalChart";

const ZODIAC = [
  { sym: "♈", name: "Ari" },
  { sym: "♉", name: "Tau" },
  { sym: "♊", name: "Gem" },
  { sym: "♋", name: "Can" },
  { sym: "♌", name: "Leo" },
  { sym: "♍", name: "Vir" },
  { sym: "♎", name: "Lib" },
  { sym: "♏", name: "Sco" },
  { sym: "♐", name: "Sag" },
  { sym: "♑", name: "Cap" },
  { sym: "♒", name: "Aqu" },
  { sym: "♓", name: "Pis" },
] as const;

function wheelPoint(
  cx: number,
  cy: number,
  r: number,
  lonDeg: number,
  ascDeg: number,
): { x: number; y: number } {
  const delta = ((lonDeg - ascDeg) * Math.PI) / 180;
  const x = cx + r * Math.cos(Math.PI - delta);
  const y = cy - r * Math.sin(Math.PI - delta);
  return { x, y };
}

function titleFor(lang: AppLang): string {
  if (lang === "pl") return "Wykres natalny (ekliptyka, Asc po lewej)";
  if (lang === "es") return "Gráfico natal (eclíptica, Asc a la izquierda)";
  return "Natal wheel (ecliptic, Asc on the left)";
}

export function NatalChartWheel({
  chart,
  lang = "en",
}: {
  chart: NatalChartPayload;
  lang?: AppLang;
}) {
  const size = 340;
  const cx = size / 2;
  const cy = size / 2;
  const rOuter = size * 0.42;
  const rInner = size * 0.3;
  const rLabel = size * 0.36;
  const asc = chart.ascendantDeg;

  const ascLine = wheelPoint(cx, cy, rOuter + 8, asc, asc);

  return (
    <div className="mx-auto w-full max-w-sm">
      <p className="mb-3 text-center text-xs text-white/55">{titleFor(lang)}</p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-[340px] drop-shadow-[0_0_24px_rgba(167,139,250,0.12)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="wheelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(167, 139, 250, 0.35)" />
            <stop offset="100%" stopColor="rgba(99, 102, 241, 0.2)" />
          </linearGradient>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 10}
          fill="rgba(0,0,0,0.25)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        {ZODIAC.map((z, i) => {
          const startLon = i * 30;
          const midLon = startLon + 15;
          const outer0 = wheelPoint(cx, cy, rOuter, startLon, asc);
          const inner0 = wheelPoint(cx, cy, rInner, startLon, asc);
          const lab = wheelPoint(cx, cy, rLabel, midLon, asc);
          const alt = i % 2 === 0;
          return (
            <g key={z.name}>
              <line
                x1={inner0.x}
                y1={inner0.y}
                x2={outer0.x}
                y2={outer0.y}
                stroke={
                  alt
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(167, 139, 250, 0.18)"
                }
                strokeWidth={0.75}
              />
              <text
                x={lab.x}
                y={lab.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-white/80 text-[11px]"
                style={{ fontSize: 11 }}
              >
                {z.sym}
              </text>
            </g>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={rInner - 2}
          fill="url(#wheelGrad)"
          stroke="rgba(196, 181, 253, 0.35)"
          strokeWidth={1}
        />

        <line
          x1={cx}
          y1={cy}
          x2={ascLine.x}
          y2={ascLine.y}
          stroke="rgba(251, 191, 36, 0.85)"
          strokeWidth={2}
          strokeLinecap="round"
        />

        {chart.bodies.map((b, idx) => {
          const base = rInner - 14 - (idx % 3) * 7;
          const p = wheelPoint(cx, cy, base, b.longitude, asc);
          return (
            <g key={b.id}>
              <circle
                cx={p.x}
                cy={p.y}
                r={5}
                fill="rgba(15, 10, 30, 0.9)"
                stroke="rgba(216, 180, 254, 0.9)"
                strokeWidth={1}
              />
              <text
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="fill-violet-100"
                style={{ fontSize: 6.5, fontWeight: 600 }}
              >
                {b.label.slice(0, 2).toUpperCase()}
              </text>
            </g>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={3}
          fill="rgba(250, 250, 250, 0.9)"
        />
      </svg>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-white/45">
        {lang === "pl"
          ? "Planety na kole ekliptyki względem Ascendentu. To uproszczona wizualizacja biblioteki astronomy-engine."
          : lang === "es"
            ? "Planetas en la eclíptica respecto al Ascendente. Visualización simplificada (astronomy-engine)."
            : "Planets on the ecliptic relative to the Ascendant. Simplified view (astronomy-engine)."}
      </p>
    </div>
  );
}
