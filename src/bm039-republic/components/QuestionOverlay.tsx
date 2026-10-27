// Вопрос для размышления: во время паузы после вопроса ведущего на экране
// остаётся сам вопрос. Без таймеров и отсчётов — только спокойная карточка.
import React from "react";
import { interpolate, spring, useCurrentFrame } from "remotion";
import { C, FONT, FPS } from "../theme";
import type { TimedLine } from "../timeline";

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export const QuestionOverlay: React.FC<{ lines: TimedLine[] }> = ({ lines }) => {
  const frame = useCurrentFrame();
  const t = frame / FPS;
  const q = lines.find((l) => l.waitFrom !== undefined && t >= l.waitFrom - 0.2 && t <= l.waitTo! + 0.4);
  if (!q) return null;
  const pop = spring({ frame: frame - Math.round((q.waitFrom! - 0.2) * FPS), fps: FPS, config: { damping: 14 } });
  const out = interpolate(t, [q.waitTo!, q.waitTo! + 0.4], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const glow = 0.5 + 0.5 * Math.sin(t * 2.4);
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, display: "flex", justifyContent: "center", transform: `scale(${pop * out})`, transformOrigin: "50% 100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 26, padding: "22px 36px", borderRadius: 34, background: "rgba(14,18,44,0.92)", boxShadow: "0 10px 40px rgba(0,0,0,0.4)", border: "2px solid rgba(255,210,63,0.6)" }}>
        <svg width={96} height={96} viewBox="-50 -50 100 100">
          <circle r={44} fill={C.yellow} opacity={0.18 + 0.15 * glow} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <circle key={i} cx={Math.cos((i / 6) * Math.PI * 2 + t) * 26} cy={Math.sin((i / 6) * Math.PI * 2 + t) * 26} r={7} fill={["#ffd23f", "#ff7a6b", "#5cc8ff", "#6ee7a8", "#a98bff", "#ff7ac6"][i]} />
          ))}
        </svg>
        <div style={{ fontFamily: FONT, color: C.text, maxWidth: 1260 }}>
          <div style={{ fontWeight: 800, fontSize: 26, color: C.yellow, letterSpacing: 1 }}>ВОПРОС ДЛЯ РАЗМЫШЛЕНИЯ</div>
          <div style={{ fontWeight: 800, fontSize: 40, lineHeight: 1.2, marginTop: 6 }}>{capitalize(q.text.replace(/^(Вопрос для размышления:)\s*/, ""))}</div>
        </div>
      </div>
    </div>
  );
};
