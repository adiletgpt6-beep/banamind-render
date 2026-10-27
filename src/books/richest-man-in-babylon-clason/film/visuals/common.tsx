// Общие детали сцен BM-036: герои из точек с подписью, облачка реплик, отметки ✓/✗,
// карточки-таблички, полоски долей. Всё зависит только от времени сцены.
import React from "react";
import { C, FONT, HEAVY } from "../theme";
import { Dots } from "./dots";
import { Check, clamp01, Cross, Label, pop, Txt } from "./kit";

export type HeroKind = "person" | "elder" | "traveler";

// герой: фигура из точек + имя под ней
export const Hero: React.FC<{ t: number; at: number; x: number; y: number; size?: number; kind?: HeroKind; a: string; b?: string; c?: string; name?: string; out?: number; flip?: boolean; dim?: number }> = ({
  t,
  at: a0,
  x,
  y,
  size = 260,
  kind = "person",
  a,
  b,
  c,
  name,
  out,
  flip,
  dim,
}) => {
  size = Math.round(size * 1.35);
  return (
  <g>
    <g transform={flip ? `translate(${2 * x} 0) scale(-1 1)` : undefined}>
      <Dots shape={kind} x={x} y={y} size={size} t={t} at={a0} sp={size > 260 ? 11 : size > 180 ? 9 : 7} colors={{ a, b: b ?? C.gold, c }} out={out} outMode="fade" dim={dim} />
    </g>
    {name && <Label x={x} y={y + size * 0.47 + 30} text={name} k={pop(t, a0 + 0.5) * (out !== undefined ? 1 - clamp01((t - out) / 0.5) : 1)} size={30} />}
  </g>
  );
};

// облачко реплики с хвостиком (dir: куда смотрит хвост)
export const Bubble: React.FC<{ x: number; y: number; text: string; k: number; tail?: "left" | "right" | "down"; bg?: string; color?: string; size?: number; w?: number }> = ({ x, y, text, k, tail = "down", bg = C.white, color = C.ink, size = 36, w }) => {
  if (k <= 0) return null;
  const lines = text.split("\n");
  const longest = Math.max(...lines.map((s) => s.length));
  const bw = w ?? longest * size * 0.56 + size * 1.4;
  const bh = lines.length * size * 1.22 + size * 0.8;
  const tx = tail === "left" ? -bw / 2 + 40 : tail === "right" ? bw / 2 - 40 : 0;
  return (
    <g transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * k})`} opacity={clamp01(k * 1.6)}>
      <rect x={-bw / 2 + 5} y={-bh / 2 + 7} width={bw} height={bh} rx={size * 0.7} fill={C.ink} opacity={0.08} />
      <path d={`M ${tx - 18} ${bh / 2 - 4} L ${tx + (tail === "left" ? -26 : tail === "right" ? 26 : 0)} ${bh / 2 + 34} L ${tx + 18} ${bh / 2 - 4} Z`} fill={bg} />
      <rect x={-bw / 2} y={-bh / 2} width={bw} height={bh} rx={size * 0.7} fill={bg} />
      <Txt x={0} y={-((lines.length - 1) * size * 1.22) / 2 + size * 0.35} size={size} color={color} w={bw - size * 0.8}>
        {text}
      </Txt>
    </g>
  );
};

export const Mark: React.FC<{ x: number; y: number; ok: boolean; k: number; s?: number }> = ({ x, y, ok, k, s = 46 }) => (ok ? <Check x={x} y={y} s={s} k={k} /> : <Cross x={x} y={y} s={s * 1.2} k={k} />);

// карточка-табличка: заголовок и строки (строка появляется по своему k)
export const Card: React.FC<{ x: number; y: number; w: number; h: number; k: number; fill?: string; stroke?: string; title?: string; titleColor?: string; children?: React.ReactNode }> = ({ x, y, w, h, k, fill = C.white, stroke, title, titleColor = C.inkSoft, children }) => {
  if (k <= 0) return null;
  return (
    <g opacity={clamp01(k * 1.5)} transform={`translate(0 ${(1 - k) * 24})`}>
      <rect x={x + 6} y={y + 10} width={w} height={h} rx={32} fill={C.ink} opacity={0.08} />
      <rect x={x} y={y} width={w} height={h} rx={32} fill={fill} stroke={stroke} strokeWidth={stroke ? 6 : 0} />
      {title && (
        <text x={x + w / 2} y={y + 56} fontFamily={FONT} fontWeight={900} fontSize={36} fill={titleColor} textAnchor="middle">
          {title}
        </text>
      )}
      {children}
    </g>
  );
};

// полоса долей (горизонтальная): части с цветами и подписями; точность — числа из кода
export const ShareBar: React.FC<{ x: number; y: number; w: number; h?: number; parts: { v: number; color: string; label?: string }[]; k: number; total?: number; fmt?: (v: number) => string }> = ({ x, y, w, h = 70, parts, k, total, fmt }) => {
  const sum = total ?? parts.reduce((a, b) => a + b.v, 0);
  let acc = 0;
  return (
    <g opacity={clamp01(k * 2)}>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={C.greyLight} />
      <clipPath id={`clip-${x}-${y}`}>
        <rect x={x} y={y} width={w * clamp01(k)} height={h} rx={h / 2} />
      </clipPath>
      <g clipPath={`url(#clip-${x}-${y})`}>
        {parts.map((pt, i) => {
          const pw = (pt.v / sum) * w;
          const px = x + acc;
          acc += pw;
          return (
            <g key={i}>
              <rect x={px} y={y} width={pw} height={h} fill={pt.color} />
              {pw > 70 && (
                <text x={px + pw / 2} y={y + h / 2 + 13} fontFamily={HEAVY} fontWeight={800} fontSize={36} fill={C.white} textAnchor="middle">
                  {pt.label ?? (fmt ? fmt(pt.v) : String(pt.v))}
                </text>
              )}
            </g>
          );
        })}
      </g>
    </g>
  );
};

// короткая строка-пункт с отметкой
export const Item: React.FC<{ x: number; y: number; text: string; k: number; mark?: { ok: boolean; k: number }; strike?: number; size?: number; color?: string; w?: number }> = ({ x, y, text, k, mark, strike = 0, size = 38, color = C.ink, w = 560 }) => {
  if (k <= 0) return null;
  return (
    <g opacity={clamp01(k * 1.6) * (strike > 0 ? 1 - 0.45 * strike : 1)} transform={`translate(${(1 - k) * 30} 0)`}>
      <Txt x={x} y={y} size={size} anchor="start" color={color} w={w}>
        {text}
      </Txt>
      {strike > 0 && <line x1={x - 6} y1={y - size * 0.32} x2={x - 6 + (Math.min(w, text.length * size * 0.56) + 12) * clamp01(strike)} y2={y - size * 0.32} stroke={C.red} strokeWidth={6} strokeLinecap="round" />}
      {mark && <Mark x={x - 42} y={y - size * 0.3} ok={mark.ok} k={mark.k} s={30} />}
    </g>
  );
};

// мягкое появление группы (сдвиг + прозрачность)
export const Fade: React.FC<{ k: number; dx?: number; dy?: number; children: React.ReactNode }> = ({ k, dx = 0, dy = 24, children }) =>
  k <= 0 ? null : (
    <g opacity={clamp01(k * 1.4)} transform={`translate(${(1 - k) * dx} ${(1 - k) * dy})`}>
      {children}
    </g>
  );
