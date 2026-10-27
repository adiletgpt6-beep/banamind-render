import { shape, sunParts, sunArcParts, starsParts, crescentParts, phasesParts } from "../shapes/catalog";
import { Scene, WHITE, NAVY, C, heading, ayahCaption, MUTED_DARK } from "./types";

// 35–46 с: «День сменяется ночью. Солнце движется, а у Луны меняются фазы. Всё это — повод задуматься».
// Одно и то же звёздное поле во всех кадрах — точки звёзд не прыгают.
export const STARS = () =>
  starsParts(4242, 70, 330, 1640, (x, y) => Math.hypot(x - 540, y - 930) < 340 || (y > 1080 && y < 1300) || (y < 470 && x > 160 && x < 920));

export const scene05: Scene = {
  id: "s5", title: "День и ночь", from: 34.4, to: 45.4,
  keyframes: [
    // тысячи зелёных точек поднимаются вверх, меняют цвет и собираются в Солнце
    { at: 35.75, shape: shape("s5-sun", sunParts(540, 900, 200)), tr: { dur: 1.35, path: "rise", lift: 420, order: "radial", stagger: 0.35, staggerBy: "-y", via: "earth", swell: 0.25 } },
    { at: 37.65, shape: shape("s5-sunarc", sunParts(376, 862, 105, 9), sunArcParts(), STARS()), tr: { dur: 1.3, path: "curve", curl: 0.2, match: [[[0], [0]]], order: "hilbert", stagger: 0.3, staggerBy: "x" } },
    // WOW: Солнце → Луна. Цвет идёт жёлтый → розовый → фиолетовый → синий
    { at: 39.0, shape: shape("s5-moon", crescentParts(540, 930, 290), STARS()), tr: { dur: 1.35, path: "spiral", turns: 0.3, cx: 540, cy: 930, match: [[[0, 1], [0]], [[2], [1]]], order: "angle", stagger: 0.35, staggerBy: "-radial", via: "sunset", swell: 0.2 } },
    { at: 40.15, shape: shape("s5-phases", crescentParts(540, 720, 175, 9), phasesParts(1185, 78), STARS()), tr: { dur: 1.1, path: "curve", curl: 0.25, match: [[[0], [0, 1, 2, 3, 4, 5]], [[1], [6]]], order: "y", stagger: 0.3, staggerBy: "y" } },
  ],
  texts: [
    heading(35.0, 36.2, [{ t: "ДЕНЬ", c: C.orange }], NAVY),
    heading(36.4, 37.0, [{ t: "НОЧЬ", c: C.sky }], WHITE),
    heading(37.05, 38.55, [{ t: "СОЛНЦЕ", c: C.yellow }], WHITE),
    heading(38.6, 40.35, [{ t: "ЛУНА", c: C.lilac }], WHITE),
    heading(40.4, 45.3, ["Повод ", { t: "задуматься", c: C.cyan }], WHITE, 56),
    { from: 40.4, to: 45.3, y: 1318, size: 34, weight: 700, font: "manrope", color: MUTED_DARK, spans: ["фазы Луны"], anim: "fade" },
    { ...ayahCaption(35.2, 36.2, "Сура Ясин, 36:37–40", false) },
    ayahCaption(36.4, 45.3, "Сура Ясин, 36:37–40"),
  ],
  cues: [{ at: 35.0, kind: "sparkle", gain: 0.55 }, { at: 37.7, kind: "whoosh", dur: 1.4, gain: 0.5 }, { at: 38.9, kind: "chime", gain: 0.55 }],
};
