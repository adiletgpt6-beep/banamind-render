import { shape, digits, grid83, bookParts } from "../shapes/catalog";
import { Scene, NAVY, C, heading, MUTED_LIGHT } from "./types";

// 7–15 с: «Это тридцать шестая сура Корана. В ней восемьдесят три аята. Она была ниспослана в Мекке».
export const scene02: Scene = {
  id: "s2", title: "36 и 83", from: 6.9, to: 14.6,
  keyframes: [
    // RAINBOW ASSEMBLY: ленты рассыпаются облаком и собираются в 36
    { at: 8.1, shape: shape("s2-36", digits("36", "num36")), tr: { dur: 1.4, path: "scatter", spread: 430, cy: 1000, order: "hilbert", stagger: 0.35, staggerBy: "random", swell: 0.35 } },
    // COLORFUL DOT MORPHING: те же точки перестраиваются из 36 в 83
    { at: 10.55, shape: shape("s2-83", digits("83", "num83")), tr: { dur: 1.15, path: "curve", curl: 0.55, swirl: 1, order: "hilbert", stagger: 0.3, staggerBy: "x", swell: 0.25 } },
    // 83 → РОВНО 83 точки-аята
    { at: 11.55, shape: shape("s2-grid83", grid83()), tr: { dur: 0.9, path: "curve", curl: 0.2, order: "y", stagger: 0.25, staggerBy: "y" }, float: 0.6 },
    // COLOR GRID TRANSFORMATION: сетка изгибается и раскрывается в книгу
    { at: 13.3, shape: shape("s2-book", bookParts(540, 980, 840, 520, "bookLight")), tr: { dur: 1.25, path: "wave", lift: 70, order: "hilbert", stagger: 0.45, staggerBy: "-y", swell: 0.2 } },
  ],
  texts: [
    heading(7.15, 9.65, [{ t: "36", c: C.pink }, "-я сура Корана"], NAVY, 60),
    heading(9.75, 12.4, ["В ней ", { t: "83", c: C.purple }, " аята"], NAVY, 60),
    { from: 11.6, to: 12.4, y: 1470, size: 38, weight: 700, font: "manrope", color: MUTED_LIGHT, spans: ["1 точка = 1 аят"], anim: "fade" },
    heading(12.5, 14.55, [{ t: "МЕККАНСКАЯ", c: C.blue }, "\nСУРА"], NAVY, 60, 320),
  ],
  cues: [{ at: 8.0, kind: "chime", gain: 0.55 }, { at: 10.45, kind: "chime", gain: 0.5 }, { at: 11.6, kind: "sparkle", gain: 0.7 }],
};
