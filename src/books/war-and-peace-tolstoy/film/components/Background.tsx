// Фон «Масштаба выбора»: у каждого слоя карты своя фактура.
//   l1 — тёплая бумага: лёгкие штрихи пера и мягкое окно света;
//   l2 — карта-калька: сетка, горизонтали рельефа, роза ветров;
//   l3 — индиго: редкие чёткие точки-решения, медленно дрейфующие (без размытия).
// Смена слоя — плавное перетекание цвета и фактуры. Случайность детерминирована.
import React from "react";
import { AbsoluteFill, interpolateColors, useCurrentFrame } from "remotion";
import { C, FPS, LAYER_BG } from "../theme";
import type { LayerId } from "../types";

// детерминированный «случайный» генератор
export const rnd = (i: number, salt = 0) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const Paper: React.FC<{ t: number }> = ({ t }) => (
  <g>
    <defs>
      <radialGradient id="bgWarm" cx="78%" cy="18%" r="70%">
        <stop offset="0%" stopColor="#fff" stopOpacity={0.7} />
        <stop offset="100%" stopColor="#fff" stopOpacity={0} />
      </radialGradient>
    </defs>
    <rect width={1920} height={1080} fill="url(#bgWarm)" />
    {/* штрихи пера — как поля рукописи */}
    {Array.from({ length: 14 }).map((_, i) => (
      <line key={i} x1={0} x2={1920} y1={90 + i * 72} y2={90 + i * 72} stroke="#b8946a" strokeOpacity={0.08} strokeWidth={2} />
    ))}
    <line x1={150} y1={0} x2={150} y2={1080} stroke="#c97a5a" strokeOpacity={0.12} strokeWidth={3} />
    {Array.from({ length: 10 }).map((_, i) => {
      const x = 260 + rnd(i, 1) * 1500;
      const y = 120 + rnd(i, 2) * 800 + Math.sin(t * 0.3 + i) * 6;
      return <circle key={i} cx={x} cy={y} r={3} fill="#c98a12" opacity={0.18} />;
    })}
  </g>
);

const MapPaper: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 21 }).map((_, i) => (
      <line key={`v${i}`} x1={i * 96} y1={0} x2={i * 96} y2={1080} stroke="#5d7591" strokeOpacity={0.1} strokeWidth={2} />
    ))}
    {Array.from({ length: 12 }).map((_, i) => (
      <line key={`h${i}`} x1={0} y1={i * 96} x2={1920} y2={i * 96} stroke="#5d7591" strokeOpacity={0.1} strokeWidth={2} />
    ))}
    {/* горизонтали рельефа */}
    {[0, 1, 2, 3, 4].map((i) => (
      <ellipse key={i} cx={1500} cy={820} rx={140 + i * 90} ry={70 + i * 46} fill="none" stroke="#5d7591" strokeOpacity={0.12} strokeWidth={3} transform={`rotate(-8 1500 820)`} />
    ))}
    {[0, 1, 2].map((i) => (
      <ellipse key={`b${i}`} cx={330} cy={260} rx={100 + i * 70} ry={50 + i * 34} fill="none" stroke="#5d7591" strokeOpacity={0.1} strokeWidth={3} />
    ))}
    {/* роза ветров */}
    <g transform={`translate(1800 120) rotate(${Math.sin(t * 0.2) * 3})`} opacity={0.22}>
      <path d="M 0 -60 L 12 0 L 0 60 L -12 0 Z" fill="#2f4a6a" />
      <path d="M -60 0 L 0 12 L 60 0 L 0 -12 Z" fill="#2f4a6a" opacity={0.6} />
      <circle r={20} fill="none" stroke="#2f4a6a" strokeWidth={3} />
    </g>
  </g>
);

const Night: React.FC<{ t: number }> = ({ t }) => (
  <g>
    {Array.from({ length: 90 }).map((_, i) => {
      const x = (rnd(i, 3) * 1920 + t * (2 + rnd(i, 4) * 5)) % 1920;
      const y = rnd(i, 5) * 1080;
      const r = 2 + Math.floor(rnd(i, 6) * 3);
      return <circle key={i} cx={x} cy={y} r={r} fill={C.dots[i % C.dots.length]} opacity={0.32} />;
    })}
  </g>
);

const Texture: React.FC<{ layer: LayerId; t: number }> = ({ layer, t }) => (layer === "l1" ? <Paper t={t} /> : layer === "l2" ? <MapPaper t={t} /> : <Night t={t} />);

export const Background: React.FC<{ layer: LayerId; prev: LayerId; k: number }> = ({ layer, prev, k }) => {
  const t = useCurrentFrame() / FPS;
  const [a1, b1] = LAYER_BG[prev];
  const [a2, b2] = LAYER_BG[layer];
  const top = interpolateColors(k, [0, 1], [a1, a2]);
  const bottom = interpolateColors(k, [0, 1], [b1, b2]);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {prev !== layer && k < 1 && (
          <g opacity={1 - k}>
            <Texture layer={prev} t={t} />
          </g>
        )}
        <g opacity={prev !== layer ? k : 1}>
          <Texture layer={layer} t={t} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
