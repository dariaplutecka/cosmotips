"use client";

import { arc } from "d3-shape";
import type { AppLang } from "@/lib/reportSchema";
import type { NatalBody, NatalChartPayload } from "@/lib/natalChart";

const ZODIAC = [
  { sym: "♈", name: "Aries", color: "rgba(244, 114, 182, 0.18)" },
  { sym: "♉", name: "Taurus", color: "rgba(52, 211, 153, 0.16)" },
  { sym: "♊", name: "Gemini", color: "rgba(251, 191, 36, 0.16)" },
  { sym: "♋", name: "Cancer", color: "rgba(96, 165, 250, 0.16)" },
  { sym: "♌", name: "Leo", color: "rgba(248, 113, 113, 0.17)" },
  { sym: "♍", name: "Virgo", color: "rgba(45, 212, 191, 0.15)" },
  { sym: "♎", name: "Libra", color: "rgba(250, 204, 21, 0.15)" },
  { sym: "♏", name: "Scorpio", color: "rgba(168, 85, 247, 0.17)" },
  { sym: "♐", name: "Sagittarius", color: "rgba(251, 146, 60, 0.16)" },
  { sym: "♑", name: "Capricorn", color: "rgba(148, 163, 184, 0.16)" },
  { sym: "♒", name: "Aquarius", color: "rgba(34, 211, 238, 0.15)" },
  { sym: "♓", name: "Pisces", color: "rgba(129, 140, 248, 0.17)" },
] as const;

const PLANET_GLYPHS: Record<string, string> = {
  sun: "☉",
  moon: "☽",
  mercury: "☿",
  venus: "♀",
  mars: "♂",
  jupiter: "♃",
  saturn: "♄",
  uranus: "♅",
  neptune: "♆",
  pluto: "♇",
};

const ASPECTS = [
  { angle: 0, orb: 5, stroke: "rgba(250, 204, 21, 0.45)", width: 1 },
  { angle: 60, orb: 4, stroke: "rgba(96, 165, 250, 0.45)", width: 0.9 },
  { angle: 90, orb: 5, stroke: "rgba(248, 113, 113, 0.5)", width: 1.1 },
  { angle: 120, orb: 5, stroke: "rgba(52, 211, 153, 0.45)", width: 0.9 },
  { angle: 180, orb: 5, stroke: "rgba(248, 113, 113, 0.5)", width: 1.1 },
] as const;

function normalizeDeg(deg: number) {
  const n = deg % 360;
  return n < 0 ? n + 360 : n;
}

function angleDiff(a: number, b: number) {
  const diff = Math.abs(normalizeDeg(a - b));
  return diff > 180 ? 360 - diff : diff;
}

function screenTheta(lonDeg: number, ascDeg: number) {
  return Math.PI - (normalizeDeg(lonDeg - ascDeg) * Math.PI) / 180;
}

function d3Angle(lonDeg: number, ascDeg: number) {
  return screenTheta(lonDeg, ascDeg) + Math.PI / 2;
}

function wheelPoint(
  cx: number,
  cy: number,
  r: number,
  lonDeg: number,
  ascDeg: number,
): { x: number; y: number } {
  const theta = screenTheta(lonDeg, ascDeg);
  return {
    x: cx + r * Math.cos(theta),
    y: cy + r * Math.sin(theta),
  };
}

function signArcPath(
  startLon: number,
  endLon: number,
  ascDeg: number,
  innerRadius: number,
  outerRadius: number,
) {
  let startAngle = d3Angle(endLon, ascDeg);
  let endAngle = d3Angle(startLon, ascDeg);
  while (endAngle < startAngle) endAngle += Math.PI * 2;
  return (
    arc<void>()
      .innerRadius(innerRadius)
      .outerRadius(outerRadius)
      .startAngle(startAngle)
      .endAngle(endAngle)
      .cornerRadius(2)() ?? undefined
  );
}

function titleFor(lang: AppLang): string {
  if (lang === "pl") return "Wykres natalny";
  if (lang === "es") return "Carta natal";
  return "Natal chart";
}

function noteFor(lang: AppLang): string {
  if (lang === "pl") {
    return "Znaki, domy całoznakowe od Ascendentu, planety i główne aspekty na kole ekliptyki.";
  }
  if (lang === "es") {
    return "Signos, casas enteras desde el Ascendente, planetas y aspectos principales en la eclíptica.";
  }
  return "Signs, whole-sign houses from the Ascendant, planets, and major aspects on the ecliptic wheel.";
}

function degreeInSign(longitude: number) {
  return Math.floor(normalizeDeg(longitude) % 30);
}

function formatPlanetDegree(body: NatalBody) {
  return `${degreeInSign(body.longitude)}°`;
}

function displayBodies(bodies: NatalBody[]) {
  const sorted = [...bodies].sort((a, b) => a.longitude - b.longitude);
  return sorted.map((body, index) => {
    const prev = sorted[(index - 1 + sorted.length) % sorted.length];
    const next = sorted[(index + 1) % sorted.length];
    const closeToPrev = prev ? angleDiff(body.longitude, prev.longitude) < 9 : false;
    const closeToNext = next ? angleDiff(body.longitude, next.longitude) < 9 : false;
    const lane = closeToPrev || closeToNext ? (index % 5) - 2 : 0;
    return { ...body, lane };
  });
}

function aspectLines(bodies: NatalBody[]) {
  const lines: Array<{
    a: NatalBody;
    b: NatalBody;
    stroke: string;
    width: number;
  }> = [];

  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const a = bodies[i];
      const b = bodies[j];
      const diff = angleDiff(a.longitude, b.longitude);
      const aspect = ASPECTS.find((candidate) => {
        if (candidate.angle === 0) return diff <= candidate.orb;
        return Math.abs(diff - candidate.angle) <= candidate.orb;
      });
      if (aspect) {
        lines.push({ a, b, stroke: aspect.stroke, width: aspect.width });
      }
    }
  }

  return lines;
}

export function NatalChartWheel({
  chart,
  lang = "en",
}: {
  chart: NatalChartPayload;
  lang?: AppLang;
}) {
  const size = 560;
  const cx = size / 2;
  const cy = size / 2;
  const asc = chart.ascendantDeg;
  const rOuter = 252;
  const rZodiacInner = 214;
  const rHouseInner = 146;
  const rAspect = 130;
  const rPlanet = 190;
  const rPlanetLabel = 176;

  const bodies = displayBodies(chart.bodies);
  const ascPoint = wheelPoint(cx, cy, rOuter + 8, asc, asc);
  const dscPoint = wheelPoint(cx, cy, rOuter + 8, asc + 180, asc);

  return (
    <div className="mx-auto w-full max-w-2xl">
      <p className="mb-4 text-center text-sm font-medium text-violet-100/80">
        {titleFor(lang)}
      </p>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="mx-auto h-auto w-full max-w-[560px] drop-shadow-[0_0_32px_rgba(167,139,250,0.16)]"
        role="img"
        aria-label={titleFor(lang)}
      >
        <defs>
          <radialGradient id="chartCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(76, 29, 149, 0.34)" />
            <stop offset="70%" stopColor="rgba(30, 27, 75, 0.2)" />
            <stop offset="100%" stopColor="rgba(0, 0, 0, 0.1)" />
          </radialGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle
          cx={cx}
          cy={cy}
          r={rOuter + 18}
          fill="rgba(3, 7, 18, 0.42)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={1}
        />

        <g transform={`translate(${cx}, ${cy})`}>
          {ZODIAC.map((z, i) => (
            <path
              key={z.name}
              d={signArcPath(i * 30, i * 30 + 30, asc, rZodiacInner, rOuter)}
              fill={z.color}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={0.8}
            />
          ))}
        </g>

        {[...Array(72)].map((_, i) => {
          const lon = i * 5;
          const major = i % 6 === 0;
          const p1 = wheelPoint(cx, cy, major ? rZodiacInner - 5 : rZodiacInner, lon, asc);
          const p2 = wheelPoint(cx, cy, rOuter, lon, asc);
          return (
            <line
              key={`tick-${lon}`}
              x1={p1.x}
              y1={p1.y}
              x2={p2.x}
              y2={p2.y}
              stroke={major ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.12)"}
              strokeWidth={major ? 1 : 0.55}
            />
          );
        })}

        {ZODIAC.map((z, i) => {
          const p = wheelPoint(cx, cy, (rOuter + rZodiacInner) / 2, i * 30 + 15, asc);
          return (
            <text
              key={`sign-${z.name}`}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(255,255,255,0.9)"
              style={{ fontSize: 23 }}
            >
              {z.sym}
            </text>
          );
        })}

        <circle
          cx={cx}
          cy={cy}
          r={rZodiacInner}
          fill="url(#chartCore)"
          stroke="rgba(196, 181, 253, 0.32)"
          strokeWidth={1}
        />
        <circle
          cx={cx}
          cy={cy}
          r={rHouseInner}
          fill="rgba(15, 23, 42, 0.28)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        {[...Array(12)].map((_, i) => {
          const lon = asc + i * 30;
          const p1 = wheelPoint(cx, cy, rHouseInner, lon, asc);
          const p2 = wheelPoint(cx, cy, rZodiacInner, lon, asc);
          const label = wheelPoint(cx, cy, rHouseInner + 18, lon + 15, asc);
          return (
            <g key={`house-${i + 1}`}>
              <line
                x1={p1.x}
                y1={p1.y}
                x2={p2.x}
                y2={p2.y}
                stroke="rgba(216, 180, 254, 0.28)"
                strokeWidth={i === 0 || i === 6 ? 1.25 : 0.75}
                strokeDasharray={i === 0 || i === 6 ? undefined : "3 5"}
              />
              <text
                x={label.x}
                y={label.y}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.42)"
                style={{ fontSize: 10, fontWeight: 700 }}
              >
                {i + 1}
              </text>
            </g>
          );
        })}

        <line
          x1={ascPoint.x}
          y1={ascPoint.y}
          x2={dscPoint.x}
          y2={dscPoint.y}
          stroke="rgba(251, 191, 36, 0.9)"
          strokeWidth={2}
          strokeLinecap="round"
          filter="url(#softGlow)"
        />
        <text
          x={ascPoint.x - 8}
          y={ascPoint.y}
          textAnchor="end"
          dominantBaseline="middle"
          fill="rgba(251, 191, 36, 0.95)"
          style={{ fontSize: 11, fontWeight: 800 }}
        >
          ASC
        </text>
        <text
          x={dscPoint.x + 8}
          y={dscPoint.y}
          textAnchor="start"
          dominantBaseline="middle"
          fill="rgba(251, 191, 36, 0.72)"
          style={{ fontSize: 11, fontWeight: 800 }}
        >
          DSC
        </text>

        {aspectLines(chart.bodies).map((line) => {
          const a = wheelPoint(cx, cy, rAspect, line.a.longitude, asc);
          const b = wheelPoint(cx, cy, rAspect, line.b.longitude, asc);
          return (
            <line
              key={`${line.a.id}-${line.b.id}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              stroke={line.stroke}
              strokeWidth={line.width}
              strokeLinecap="round"
            />
          );
        })}

        {bodies.map((body) => {
          const exact = wheelPoint(cx, cy, rPlanet, body.longitude, asc);
          const label = wheelPoint(
            cx,
            cy,
            rPlanetLabel - body.lane * 13,
            body.longitude,
            asc,
          );
          const glyph = PLANET_GLYPHS[body.id] ?? body.label.slice(0, 1);
          return (
            <g key={body.id}>
              <line
                x1={exact.x}
                y1={exact.y}
                x2={label.x}
                y2={label.y}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth={0.7}
              />
              <circle
                cx={exact.x}
                cy={exact.y}
                r={3}
                fill="rgba(216, 180, 254, 0.95)"
              />
              <circle
                cx={label.x}
                cy={label.y}
                r={13}
                fill="rgba(15, 10, 30, 0.92)"
                stroke="rgba(216, 180, 254, 0.85)"
                strokeWidth={1}
              />
              <text
                x={label.x}
                y={label.y - 1}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(245, 243, 255, 0.98)"
                style={{ fontSize: 17 }}
              >
                {glyph}
              </text>
              <text
                x={label.x}
                y={label.y + 17}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.48)"
                style={{ fontSize: 8, fontWeight: 700 }}
              >
                {formatPlanetDegree(body)}
              </text>
            </g>
          );
        })}

        <circle cx={cx} cy={cy} r={3.5} fill="rgba(250, 250, 250, 0.95)" />
      </svg>
      <p className="mx-auto mt-3 max-w-xl text-center text-[11px] leading-relaxed text-white/45">
        {noteFor(lang)}
      </p>
    </div>
  );
}
