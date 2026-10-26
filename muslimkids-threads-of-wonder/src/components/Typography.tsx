// Типографика — отдельный чёткий слой поверх 3D. Текст никогда не плетётся из нитей,
// не деформируется и не растягивается вместе с тканью: только мягкое появление/исчезновение.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, staticFile, Easing } from "remotion";
import { loadFont } from "@remotion/fonts";
import { HEX } from "../engines/palette";
import { phraseFrame } from "../timeline";

const CYR = "U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116";
const LAT = "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2212";
for (const w of ["500", "700", "800"]) {
  loadFont({ family: "Montserrat", url: staticFile(`fonts/montserrat-cyrillic-${w}-normal.woff2`), weight: w, unicodeRange: CYR });
  loadFont({ family: "Montserrat", url: staticFile(`fonts/montserrat-latin-${w}-normal.woff2`), weight: w, unicodeRange: LAT });
}

const FONT = "Montserrat, sans-serif";
const shadow = "0 2px 10px rgba(4,12,24,0.75), 0 0 2px rgba(4,12,24,0.9)";

const fade = (f: number, a: number, b: number, inDur = 14, outDur = 16) =>
  interpolate(f, [a, a + inDur, b - outDur, b], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.inOut(Easing.sin) });

const Label: React.FC<{ text: string; color: string; x: number; y: number; o: number; align?: "left" | "right" }> = ({ text, color, x, y, o, align = "left" }) => (
  <div
    style={{
      position: "absolute", top: y, [align]: x, opacity: o, transform: `translateY(${(1 - o) * 10}px)`,
      fontFamily: FONT, fontWeight: 800, fontSize: 58, letterSpacing: 8, color, textShadow: shadow,
      display: "flex", alignItems: "center", gap: 18,
    }}
  >
    <span style={{ width: 14, height: 14, borderRadius: 7, background: color, boxShadow: `0 0 18px ${color}` }} />
    {text}
  </div>
);

export const Typography: React.FC = () => {
  const f = useCurrentFrame();
  const { width } = useVideoConfig();
  // Сцена 1: деликатная заставка названия
  const title = fade(f, 20, 150, 18, 22);
  // Сцена 2: ДЕНЬ / НОЧЬ на словах диктора
  const day = fade(f, phraseFrame("s2", 2) + 18, 432, 14, 18);
  const night = fade(f, phraseFrame("s2", 3) + 22, 432, 14, 18);
  // Сцена 5: заголовок
  const reflect = fade(f, 1238, 1360, 18, 22);
  // Сцена 6: цитата перевода смысла
  const quote = fade(f, 1396, 1628, 24, 26);
  // Сцена 7: финал
  const ask = fade(f, 1668, 1801, 18, 1);
  const brand = fade(f, 1712, 1801, 22, 1);

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {/* макет в 1080×1920, масштабируется под размер композиции (превью 540×960) */}
      <div style={{ position: "absolute", width: 1080, height: 1920, transform: `scale(${width / 1080})`, transformOrigin: "0 0" }}>
      {/* затемнение-подложка для читаемости: верх и низ */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(5,14,26,0.55) 0%, rgba(5,14,26,0) 22%)", opacity: Math.max(reflect, ask * 0.6) }} />
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(5,14,26,0.82) 0%, rgba(5,14,26,0.55) 30%, rgba(5,14,26,0) 52%)", opacity: quote }} />

      {title > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 250, textAlign: "center", opacity: title, fontFamily: FONT, color: HEX.milk, textShadow: shadow }}>
          <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: 12, color: HEX.gold }}>MUSLIM KIDS</div>
          <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: 3, marginTop: 14, lineHeight: 1.15 }}>УДИВИТЕЛЬНАЯ<br />КАРТИНА МИРА</div>
        </div>
      )}

      {day > 0 && <Label text="ДЕНЬ" color={HEX.gold} x={120} y={1500} o={day} />}
      {night > 0 && <Label text="НОЧЬ" color={HEX.silver} x={120} y={1500} o={night} align="right" />}

      {reflect > 0 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 150, textAlign: "center", opacity: reflect, fontFamily: FONT, textShadow: shadow }}>
          <div style={{ fontWeight: 800, fontSize: 70, lineHeight: 1.12, color: HEX.milk, letterSpacing: 2 }}>
            РАЗМЫШЛЯЙ<br />О <span style={{ color: HEX.gold }}>ТВОРЕНИИ</span>
          </div>
          <div style={{ fontWeight: 500, fontSize: 34, marginTop: 22, color: HEX.silver }}>Сура «Аль-Имран», 3:190</div>
        </div>
      )}

      {quote > 0 && (
        <div style={{ position: "absolute", left: 70, right: 70, bottom: 250, textAlign: "center", opacity: quote, fontFamily: FONT, textShadow: shadow }}>
          <div style={{ fontWeight: 800, fontSize: 78, lineHeight: 1.16, color: HEX.milk, letterSpacing: 1 }}>
            «ГОСПОДЬ НАШ!
            <br />
            ТЫ НЕ СОТВОРИЛ
            <br />
            ЭТО <span style={{ color: HEX.gold }}>ПОНАПРАСНУ</span>»
          </div>
          <div style={{ width: 120, height: 4, borderRadius: 2, background: HEX.gold, margin: "36px auto 26px" }} />
          <div style={{ fontWeight: 700, fontSize: 38, color: HEX.milk }}>Сура «Аль-Имран», 3:191</div>
          <div style={{ fontWeight: 500, fontSize: 30, marginTop: 10, color: HEX.silver }}>Часть аята. Перевод смысла (Э. Кулиев)</div>
        </div>
      )}

      {ask > 0 && (
        <div style={{ position: "absolute", left: 60, right: 60, top: 190, textAlign: "center", opacity: ask, transform: `translateY(${(1 - ask) * 14}px)`, fontFamily: FONT, textShadow: shadow }}>
          <div style={{ fontWeight: 800, fontSize: 76, lineHeight: 1.14, color: HEX.milk }}>
            А ЧТО <span style={{ color: HEX.gold }}>УДИВЛЯЕТ</span>
            <br />
            ТЕБЯ?
          </div>
        </div>
      )}
      {brand > 0 && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 230, textAlign: "center", opacity: brand, fontFamily: FONT, textShadow: shadow }}>
          <div style={{ fontWeight: 800, fontSize: 64, letterSpacing: 14, color: HEX.milk }}>
            MUSLIM <span style={{ color: HEX.gold }}>KIDS</span>
          </div>
          <div style={{ width: 90, height: 3, borderRadius: 2, background: HEX.turquoise, margin: "22px auto 0" }} />
        </div>
      )}
      </div>
    </AbsoluteFill>
  );
};
