// Scene 1 (0–6 s) — the mysterious Earth: title hook.
import React from "react";
import { CUE } from "../compositions/cues";
import { C, HEAD, BODY, reveal, shadow } from "../components/Typography";
import { window4 } from "../utils/math";

export const Scene01Earth: React.FC<{ t: number }> = ({ t }) => {
  const k1 = window4(t, 0.35, 1.2, CUE.look - 0.2, CUE.look + 0.4);
  const k2 = window4(t, 0.75, 1.6, CUE.look - 0.2, CUE.look + 0.4);
  if (k1 <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 60, right: 60, top: 250, textAlign: "center" }}>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 30, letterSpacing: 7, color: C.gold, ...reveal(k1) }}>
        MUSLIM KIDS · СЛОИ РЕАЛЬНОСТИ
      </div>
      <div style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 60, lineHeight: 1.22, color: C.milk, marginTop: 26, textShadow: shadow, ...reveal(k2) }}>
        Что скрывается <span style={{ color: C.gold }}>внутри</span>
        <br />
        удивительного мира?
      </div>
    </div>
  );
};
