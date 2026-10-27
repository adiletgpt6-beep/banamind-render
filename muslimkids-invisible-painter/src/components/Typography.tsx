// TypographySystem — надписи отдельным неподвижным слоем поверх холста.
// Слова Корана и подписи НЕ превращаются в мазки и не размываются: чёткий шрифт,
// неподвижная позиция во время чтения, появление и исчезновение — целиком (opacity).

import { loadFont } from "@remotion/fonts";
import { continueRender, delayRender, interpolate, staticFile, useCurrentFrame } from "remotion";
import { useEffect, useState } from "react";
import { cameraAt, worldToScreen } from "../engines/PainterlyCameraController";
import { CAM_A, EARTH, S2 } from "../scenes/Scene02Earth";
import { S5 } from "../scenes/Scene05Sky";
import { S6 } from "../scenes/Scene06Quran";
import { S7 } from "../scenes/Scene07Ending";

const FONTS = [
  { family: "Nunito", file: "nunito-cyrillic-900-normal.woff2", weight: "900" },
  { family: "Nunito", file: "nunito-latin-900-normal.woff2", weight: "900" },
  { family: "Nunito", file: "nunito-cyrillic-800-normal.woff2", weight: "800" },
  { family: "Nunito", file: "nunito-latin-800-normal.woff2", weight: "800" },
  { family: "PT Serif", file: "pt-serif-cyrillic-700-normal.woff2", weight: "700" },
  { family: "PT Serif", file: "pt-serif-latin-700-normal.woff2", weight: "700" },
  { family: "PT Serif", file: "pt-serif-cyrillic-400-normal.woff2", weight: "400" },
  { family: "PT Serif", file: "pt-serif-latin-400-normal.woff2", weight: "400" },
  { family: "PT Serif", file: "pt-serif-cyrillic-400-italic.woff2", weight: "400", style: "italic" },
  { family: "PT Serif", file: "pt-serif-latin-400-italic.woff2", weight: "400", style: "italic" },
];

const useFonts = () => {
  const [handle] = useState(() => delayRender("fonts"));
  useEffect(() => {
    Promise.all(FONTS.map((f) => loadFont({ family: f.family, url: staticFile(`fonts/${f.file}`), weight: f.weight, style: f.style ?? "normal" })))
      .then(() => continueRender(handle))
      .catch((e) => {
        console.error(e);
        continueRender(handle);
      });
  }, [handle]);
};

const fadeWin = (f: number, a: number, b: number, outA?: number, outB?: number) => {
  const i = interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const o = outA === undefined ? 1 : interpolate(f, [outA, outB!], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return i * o;
};

const NUNITO = "Nunito, sans-serif";
const SERIF = "'PT Serif', serif";

/** Подпись стороны Земли с подчёркиванием, «проведённым кистью». */
const SideLabel: React.FC<{ text: string; x: number; y: number; color: string; opacity: number; }> = ({ text, x, y, color, opacity }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%, -50%)", opacity, textAlign: "center" }}>
    <div style={{ fontFamily: NUNITO, fontWeight: 900, fontSize: 62, letterSpacing: "0.08em", color, lineHeight: 1 }}>{text}</div>
    <svg width="190" height="26" viewBox="0 0 220 26" style={{ display: "block", margin: "6px auto 0" }}>
      <path d="M8 16 C 60 6, 150 22, 212 10" stroke={color} strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  </div>
);

export const Typography: React.FC = () => {
  useFonts();
  const f = useCurrentFrame();

  // ——— Сцена 2: ДЕНЬ / НОЧЬ ———
  const cam = cameraAt(CAM_A, Math.min(f, 404));
  const e = worldToScreen(cam, EARTH.x, EARTH.y);
  const R = EARTH.r * cam.zoom;
  const day = fadeWin(f, S2.day, S2.day + 14, 402, 418);
  const night = fadeWin(f, S2.night, S2.night + 14, 402, 418);

  // ——— Сцена 5 ———
  const t5 = fadeWin(f, S5.title[0], S5.title[0] + 20, S5.title[1] - 20, S5.title[1]);
  // ——— Сцена 6 ———
  const q = fadeWin(f, S6.quote[0], S6.quote[1], S6.quoteOut[0], S6.quoteOut[1]);
  // ——— Сцена 7 ———
  const ask = fadeWin(f, S7.question[0], S7.question[1]);
  const brand = fadeWin(f, S7.brand[0], S7.brand[1]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {day > 0 && <SideLabel text="ДЕНЬ" x={e.x - R - 120} y={e.y - R * 0.6} color="#A8680F" opacity={day} />}
      {night > 0 && <SideLabel text="НОЧЬ" x={e.x + R * 0.62} y={e.y + R + 95} color="#174A75" opacity={night} />}

      {t5 > 0 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 520, textAlign: "center", opacity: t5, color: "#FFFFFF", textShadow: "0 2px 18px rgba(16,28,57,0.85), 0 0 4px rgba(16,28,57,0.6)" }}>
          <div style={{ fontFamily: NUNITO, fontWeight: 900, fontSize: 70, letterSpacing: "0.05em", lineHeight: 1.12 }}>
            ЗНАМЕНИЯ
            <br />
            ДЛЯ РАЗМЫШЛЕНИЯ
          </div>
          <div style={{ margin: "26px auto 0", width: 120, height: 5, borderRadius: 3, background: "#E5AC51", opacity: 0.9 }} />
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 42, marginTop: 22 }}>Сура «Аль-Имран», 3:190</div>
          <div style={{ fontFamily: SERIF, fontSize: 30, marginTop: 10, opacity: 0.85 }}>изложение смысла</div>
        </div>
      )}

      {q > 0 && (
        <div style={{ position: "absolute", left: 90, right: 90, top: 384, textAlign: "center", opacity: q, color: "#101C39" }}>
          <div style={{ fontFamily: SERIF, fontWeight: 700, fontSize: 60, lineHeight: 1.22, letterSpacing: "0.01em" }}>
            «ГОСПОДЬ НАШ!
            <br />
            ТЫ НЕ СОТВОРИЛ
            <br />
            ЭТО ПОНАПРАСНУ»
          </div>
          <div style={{ margin: "26px auto 18px", width: 110, height: 4, borderRadius: 2, background: "#E5AC51" }} />
          <div style={{ fontFamily: SERIF, fontSize: 34, color: "#174A75" }}>Сура «Аль-Имран», 3:191</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, color: "#174A75", marginTop: 6 }}>Часть аята. Перевод смысла</div>
          <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 24, color: "#174A75", marginTop: 2, opacity: 0.85 }}>(Э. Кулиев)</div>
        </div>
      )}

      {ask > 0 && (
        <div style={{ position: "absolute", left: 40, right: 40, top: 1500, textAlign: "center", opacity: ask, fontFamily: NUNITO, fontWeight: 900, fontSize: 58, color: "#174A75", letterSpacing: "0.02em" }}>
          А ЧТО УДИВЛЯЕТ <span style={{ color: "#D0922F" }}>ТЕБЯ?</span>
        </div>
      )}
      {brand > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1610, textAlign: "center", opacity: brand }}>
          <div style={{ fontFamily: NUNITO, fontWeight: 900, fontSize: 50, letterSpacing: "0.32em", color: "#174A75", marginLeft: "0.32em" }}>MUSLIM KIDS</div>
          <div style={{ margin: "12px auto 0", width: 90, height: 5, borderRadius: 3, background: "#E5AC51" }} />
        </div>
      )}
    </div>
  );
};
