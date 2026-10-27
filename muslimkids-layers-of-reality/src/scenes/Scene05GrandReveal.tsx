// Scene 5 (35–44.6 s) — the grand exploded composition and its reassembly.
import React from "react";
import { C, HEAD, BODY, reveal, shadow } from "../components/Typography";
import { window4 } from "../utils/math";

export const Scene05GrandReveal: React.FC<{ t: number }> = ({ t }) => {
  const k1 = window4(t, 41.4, 42.2, 44.2, 44.8);
  const k2 = window4(t, 41.9, 42.7, 44.2, 44.8);
  if (k1 <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 50, right: 50, top: 250, textAlign: "center" }}>
      <div style={{ fontFamily: HEAD, fontWeight: 700, fontSize: 64, lineHeight: 1.18, color: C.milk, textShadow: shadow, ...reveal(k1) }}>
        РАЗМЫШЛЯЙ
        <br />
        О <span style={{ color: C.gold }}>ТВОРЕНИИ</span>
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 36, color: C.sky, marginTop: 26, textShadow: shadow, ...reveal(k2) }}>
        Сура «Аль-Имран», 3:190
      </div>
      <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 28, color: "rgba(247,245,239,0.75)", marginTop: 8, textShadow: shadow, ...reveal(k2) }}>
        изложение смысла аята
      </div>
    </div>
  );
};
