// Метка типа утверждения в правом верхнем углу: зритель всегда видит, что звучит —
// римская легенда, голос античного автора, находка или документ, вывод историка,
// наша условная схема или вывод фильма. Имя автора книги в кадре не называется.
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import type { Timeline } from "../timeline";
import type { Claim, Scene } from "../types";

export const CLAIMS: Record<Claim, { label: string; color: string; icon: string }> = {
  legend: { label: "Легенда · римская память", color: C.plum, icon: "q" },
  ancient: { label: "Античный голос · не камера", color: C.coral, icon: "pen" },
  find: { label: "Находка · документ", color: C.tealDeep, icon: "ring" },
  author: { label: "Вывод историка", color: C.inkSoft, icon: "book" },
  model: { label: "Наша схема · условно", color: C.sage, icon: "ring" },
  film: { label: "Вывод BanaMind", color: C.amber, icon: "star" },
};

// простые векторные значки (без эмодзи: в рендере нет цветных шрифтов)
const Icon: React.FC<{ kind: string }> = ({ kind }) => {
  const st = { fill: "none", stroke: C.white, strokeWidth: 2.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (kind === "book") return <path d="M -9 -6 L -1 -4 L -1 8 L -9 6 Z M 9 -6 L 1 -4 L 1 8 L 9 6 Z" {...st} />;
  if (kind === "q")
    return (
      <g {...st}>
        <path d="M -5 -4 Q -5 -10 0 -10 Q 6 -10 6 -5 Q 6 -1 0 1 L 0 4" />
        <circle cy={8.5} r={0.6} fill={C.white} />
      </g>
    );
  if (kind === "pen") return <path d="M -8 8 L -6 2 L 5 -9 L 9 -5 L -2 6 Z M -8 8 L -2 6" {...st} />;
  if (kind === "ring")
    return (
      <g {...st}>
        <circle r={8} />
        <circle r={3} fill={C.white} />
      </g>
    );
  return <path d="M 0 -10 L 3 -3 L 10 -3 L 4.5 2 L 6.5 9 L 0 5 L -6.5 9 L -4.5 2 L -10 -3 L -3 -3 Z" fill={C.white} />;
};

export const ClaimBadge: React.FC<{ tl: Timeline; scenes: Scene[] }> = ({ tl, scenes }) => {
  const t = useCurrentFrame() / FPS;
  let si = 0;
  while (si + 1 < tl.scenes.length && tl.scenes[si + 1].from <= t) si++;
  const claim = scenes[si].claim ?? "author";
  const ts = tl.scenes[si];
  // мягкое появление в начале сцены, исчезновение перед сменой
  const k = Math.min(
    interpolate(t, [ts.from + 0.3, ts.from + 0.8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
    interpolate(t, [ts.to - 0.35, ts.to], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  );
  if (t < 2 || k <= 0) return null;
  const c = CLAIMS[claim];
  return (
    <div style={{ position: "absolute", right: 40, top: 26, opacity: k, transform: `translateY(${(1 - k) * -12}px)` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "7px 20px 7px 8px", borderRadius: 24, background: "rgba(255,255,255,0.86)", boxShadow: "0 4px 14px rgba(34,48,74,0.14)" }}>
        <svg width={34} height={34} viewBox="-17 -17 34 34">
          <circle r={17} fill={c.color} />
          <Icon kind={c.icon} />
        </svg>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 23, color: C.ink }}>{c.label}</div>
      </div>
    </div>
  );
};
