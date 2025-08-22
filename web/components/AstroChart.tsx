"use client";
import React, { useMemo, useState } from "react";
import { Chart, TransitSet, Aspect } from "@/types";

const PLANET_GLYPH: Record<string, string> = {
  "Sun": "☉","Moon":"☽","Mercury":"☿","Venus":"♀","Mars":"♂",
  "Jupiter":"♃","Saturn":"♄","Uranus":"♅","Neptune":"♆","Pluto":"♇",
  "Chiron":"⚷","N.Node":"☊"
};
const SIGN_GLYPH = ["♈","♉","♊","♋","♌","♍","♎","♏","♐","♑","♒","♓"];

const ASPECT_COLORS: Record<string, string> = {
  conj: "#ff9800",
  opp:  "#ef4444",
  sqr:  "#ef4444",
  tri:  "#22c55e",
  sex:  "#3b82f6",
  qui:  "#a855f7"
};

type Props = {
  natal: Chart;
  transits?: TransitSet | null;
  aspectsNatal?: Aspect[];
  aspectsTransitToNatal?: Aspect[];
};

export default function AstroChart({
  natal,
  transits,
  aspectsNatal = [],
  aspectsTransitToNatal = []
}: Props) {
  const [showHouses, setShowHouses] = useState(true);
  const [showNatalAspects, setShowNatalAspects] = useState(true);
  const [showTransitAspects, setShowTransitAspects] = useState(true);
  const [showTransits, setShowTransits] = useState(true);

  const size = 520;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = 240;
  const innerR = 190;
  const zodiacR1 = 260;
  const zodiacR2 = 280;

  function angleToPoint(angleDeg: number, r: number) {
    const rad = (Math.PI / 180) * (-angleDeg);
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function tickPath(r1: number, r2: number, angle: number) {
    const p1 = angleToPoint(angle, r1);
    const p2 = angleToPoint(angle, r2);
    return `M ${p1.x} ${p1.y} L ${p2.x} ${p2.y}`;
  }

  function drawPlanet(body: string, lon: number, radius: number, color: string) {
    const p = angleToPoint(lon, radius);
    const glyph = PLANET_GLYPH[body] || body;
    return (
      <g key={`${body}-${radius}`} transform={`translate(${p.x},${p.y})`}>
        <circle r="13" fill="white" stroke={color} strokeWidth="2" />
        <text x="0" y="5" textAnchor="middle" fontSize="16" fill={color} style={{fontFamily:"'Segoe UI Symbol', 'Apple Color Emoji', sans-serif"}}>
          {glyph}
        </text>
      </g>
    );
  }

  function drawAspectLine(aLon: number, bLon: number, color: string, inner = true) {
    const pa = angleToPoint(aLon, innerR);
    const pb = angleToPoint(bLon, inner ? innerR : outerR);
    return <line x1={pa.x} y1={pa.y} x2={pb.x} y2={pb.y} stroke={color} strokeWidth="1.4" opacity="0.75" />;
  }

  const natalIndex = useMemo(() => {
    const m = new Map<string, number>();
    natal.planets.forEach(pl => m.set(pl.body, pl.lon));
    return m;
  }, [natal.planets]);

  const transitIndex = useMemo(() => {
    const m = new Map<string, number>();
    (transits?.planets || []).forEach(pl => m.set(pl.body, pl.lon));
    return m;
  }, [transits?.planets]);

  return (
    <div className="w-full flex flex-col items-center gap-3">
      <div className="flex flex-wrap gap-3 text-sm">
        <label className="flex items-center gap-2"><input type="checkbox" checked={showHouses} onChange={e=>setShowHouses(e.target.checked)} /> Дома</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={showTransits} onChange={e=>setShowTransits(e.target.checked)} /> Транзиты</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={showNatalAspects} onChange={e=>setShowNatalAspects(e.target.checked)} /> Аспекты натала</label>
        <label className="flex items-center gap-2"><input type="checkbox" checked={showTransitAspects} onChange={e=>setShowTransitAspects(e.target.checked)} /> Транзиты к наталу</label>
      </div>

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="border rounded bg-white dark:bg-zinc-900">
        <circle cx={cx} cy={cy} r={zodiacR2} fill="none" stroke="#e5e7eb" />
        <circle cx={cx} cy={cy} r={zodiacR1} fill="none" stroke="#e5e7eb" />

        {[...Array(12)].map((_,i)=>(
          <g key={i}>
            <path d={tickPath(zodiacR1, zodiacR2, i*30)} stroke="#9ca3af" />
            {(() => {
              const mid = i*30 + 15;
              const p = angleToPoint(mid, (zodiacR1+zodiacR2)/2);
              return <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central" fontSize="16" fill="#374151">{SIGN_GLYPH[i]}</text>;
            })()}
          </g>
        ))}

        <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="#d1d5db" />
        <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="#d1d5db" />

        {showHouses && natal.houses?.cusps?.length === 12 && (
          <>
            {natal.houses.cusps.map((c,i)=>(
              <g key={i}>
                <path d={tickPath(innerR-30, zodiacR1, c)} stroke="#94a3b8" strokeDasharray="4 4" />
                {(() => {
                  const p = angleToPoint(c+15, innerR-38);
                  return <text x={p.x} y={p.y} textAnchor="middle" fontSize="10" fill="#64748b">{i+1}</text>;
                })()}
              </g>
            ))}
          </>
        )}

        {showNatalAspects && aspectsNatal.map((a, idx)=>{
          const aLon = natalIndex.get(a.a);
          const bLon = natalIndex.get(a.b);
          if (aLon == null || bLon == null) return null;
          return <g key={`na-${idx}`}>{drawAspectLine(aLon, bLon, ASPECT_COLORS[a.type] || "#999", true)}</g>;
        })}

        {showTransitAspects && aspectsTransitToNatal.map((a, idx)=>{
          const aLon = transitIndex.get(a.a);
          const bLon = natalIndex.get(a.b);
          if (aLon == null || bLon == null) return null;
          return <g key={`ta-${idx}`}>{drawAspectLine(bLon, aLon, ASPECT_COLORS[a.type] || "#999", false)}</g>;
        })}

        {natal.planets.map(p => drawPlanet(p.body, p.lon, innerR, "#111827"))}
        {showTransits && (transits?.planets || []).map(p => drawPlanet(p.body, p.lon, outerR, "#0ea5e9"))}

        {natal.houses && (
          <>
            {["ASC","MC"].map((k,i)=>{
              const lon = i === 0 ? natal.houses!.asc : natal.houses!.mc;
              const p = angleToPoint(lon, zodiacR2+12);
              return <text key={k} x={p.x} y={p.y} textAnchor="middle" fontSize="12" fill="#111827">{k}</text>;
            })}
          </>
        )}
      </svg>

      <div className="text-xs text-zinc-600 dark:text-zinc-400">
        Внутреннее кольцо — натал; внешнее — текущие транзиты. Цвета аспектов: соединение — оранжевый, оппозиция/квадрат — красный, тригон — зелёный, секстиль — синий, квинконс — фиолетовый.
      </div>
    </div>
  );
}
