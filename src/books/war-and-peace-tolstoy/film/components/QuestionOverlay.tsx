// Вопрос для размышления: на время паузы после вопроса ведущего на экране
// остаётся сам вопрос. Без таймеров, отсчётов и цифр — только спокойная карточка.
import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import type { TimedLine } from "../timeline";

const PREFIX = /^(Вопрос для размышления:)\s*/;
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const QuestionOverlay: React.FC<{ lines: TimedLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const q = lines.find((l) => l.waitFrom !== undefined && t >= l.waitFrom - 0.2 && t <= l.waitTo! + 0.4);
  if (!q) return null;
  const from = q.waitFrom!;
  const to = q.waitTo!;
  const pop = spring({ frame: frame - Math.round((from - 0.2) * FPS), fps: FPS, config: { damping: 14 } });
  const out = interpolate(t, [to, to + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = 0.5 + 0.5 * Math.sin(t * 2.4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, display: "flex", justifyContent: "center", transform: `scale(${pop * out})`, transformOrigin: "50% 100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 34px", borderRadius: 36, background: C.white, boxShadow: "0 10px 30px rgba(36,50,74,0.2)", borderLeft: `10px solid ${C.goldDeep}` }}>
        <svg width={120} height={140} viewBox="-60 -70 120 140">
          <circle r={58} cy={-8} fill={C.gold} opacity={0.25 + 0.2 * glow} />
          <path d="M -30 -10 A 32 32 0 1 1 30 -10 Q 26 8 14 20 L 14 32 L -14 32 L -14 20 Q -26 8 -30 -10 Z" fill={C.gold} stroke={C.ink} strokeWidth={5} strokeLinejoin="round" />
          <rect x={-14} y={36} width={28} height={9} rx={3} fill={C.inkSoft} />
          <rect x={-10} y={48} width={20} height={8} rx={3} fill={C.inkSoft} />
        </svg>
        <div style={{ fontFamily: FONT, color: C.ink, maxWidth: 1180 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: C.inkSoft, letterSpacing: 0.5 }}>Вопрос для размышления</div>
          <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.18, marginTop: 6 }}>{capitalize(q.text.replace(PREFIX, ""))}</div>
        </div>
      </div>
    </div>
  );
};
