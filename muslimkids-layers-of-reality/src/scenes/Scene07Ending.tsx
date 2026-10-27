// Scene 7 (53.2–60 s) — "Look deeper!" and the Muslim Kids type sign-off
// (no official logo is available in this project, so none is invented).
import React from "react";
import { C, HEAD, BODY, reveal, shadow } from "../components/Typography";
import { span, easeOutCubic } from "../utils/math";
import { CUE } from "../compositions/cues";

export const Scene07Ending: React.FC<{ t: number }> = ({ t }) => {
  const k1 = easeOutCubic(span(t, CUE.lookAround + 0.4, CUE.lookAround + 1.2));
  const k2 = easeOutCubic(span(t, CUE.lookAround + 1.0, CUE.lookAround + 1.8));
  if (k1 <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 40, right: 40, top: 270, textAlign: "center" }}>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 82, lineHeight: 1.15, color: C.milk, textShadow: shadow, ...reveal(k1) }}>
        ПОСМОТРИ
        <br />
        <span style={{ color: C.gold }}>ГЛУБЖЕ!</span>
      </div>
      <div style={{ marginTop: 40, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, ...reveal(k2) }}>
        <div style={{ width: 70, height: 2, background: C.gold }} />
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 44, letterSpacing: 12, color: C.milk, textShadow: shadow }}>MUSLIM KIDS</div>
        <div style={{ width: 70, height: 2, background: C.gold }} />
      </div>
    </div>
  );
};
