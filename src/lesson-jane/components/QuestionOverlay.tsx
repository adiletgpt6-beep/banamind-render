// Вопрос для размышления: на время паузы после вопроса на экране остаётся сам
// вопрос. Без таймеров, отсчётов и цифр — только спокойная карточка.
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
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 34px", borderRadius: 30, background: C.paper, boxShadow: "0 10px 30px rgba(20,20,50,0.35)", borderLeft: `10px solid ${C.gold}` }}>
        <svg width={110} height={130} viewBox="-60 -70 120 140">
          <circle r={56} cy={-6} fill={C.gold} opacity={0.22 + 0.2 * glow} />
          <path d="M -40 -30 L 40 -30 M 0 -40 L 0 40 M -30 40 L 30 40" stroke={C.ink} strokeWidth={7} strokeLinecap="round" />
          <path d="M -40 -30 L -56 6 L -24 6 Z M 40 -30 L 24 6 L 56 6 Z" fill={C.gold} stroke={C.ink} strokeWidth={4} strokeLinejoin="round" />
        </svg>
        <div style={{ fontFamily: FONT, color: C.ink, maxWidth: 1240 }}>
          <div style={{ fontWeight: 800, fontSize: 28, color: C.inkSoft, letterSpacing: 0.5 }}>Вопрос для размышления</div>
          <div style={{ fontWeight: 900, fontSize: 40, lineHeight: 1.18, marginTop: 6 }}>{capitalize(q.text.replace(PREFIX, ""))}</div>
        </div>
      </div>
    </div>
  );
};
