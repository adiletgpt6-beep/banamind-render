// Scene 6 (44.6–53.2 s) — words of the Qur'an (translation of meaning).
// A separate, static text layer: no deformation, rotation or 3D treatment.
import React from "react";
import { CUE } from "../compositions/cues";
import { C, BODY, shadow } from "../components/Typography";
import { window4 } from "../utils/math";

export const QUOTE_WINDOW = [CUE.quote - 0.6, CUE.quote - 0.05, 52.4, 53.1] as const;

export const Scene06Quran: React.FC<{ t: number }> = ({ t }) => {
  const k = window4(t, ...QUOTE_WINDOW);
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: k }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 30% at 50% 26%, rgba(8,22,39,0.92), rgba(8,22,39,0.55) 70%, rgba(8,22,39,0) 100%)" }} />
      <div style={{ position: "absolute", left: 70, right: 70, top: 250, textAlign: "center" }}>
        <div style={{ width: 120, height: 3, background: C.gold, margin: "0 auto 46px", borderRadius: 2 }} />
        <div style={{ fontFamily: BODY, fontWeight: 800, fontSize: 70, lineHeight: 1.22, color: C.milk, letterSpacing: 1, textShadow: shadow }}>
          «ГОСПОДЬ НАШ!
          <br />
          ТЫ НЕ СОТВОРИЛ
          <br />
          ЭТО ПОНАПРАСНУ»
        </div>
        <div style={{ fontFamily: BODY, fontWeight: 700, fontSize: 38, color: C.gold, marginTop: 46 }}>Сура «Аль-Имран», 3:191</div>
        <div style={{ fontFamily: BODY, fontWeight: 600, fontSize: 30, color: C.sky, marginTop: 10 }}>
          Часть аята. Перевод смысла (Э. Кулиев)
        </div>
        <div style={{ width: 120, height: 3, background: C.gold, margin: "46px auto 0", borderRadius: 2 }} />
      </div>
    </div>
  );
};
