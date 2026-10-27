// On-screen words, one key term at a time (Instagram-safe: titles between y≈300 and y≈1450).
import { Caption } from "../components/Typography";
import { COLORS } from "../styles/theme";

export const CAPTIONS: Caption[] = [
  // Scene 2 — the planet
  { t0: 6.6, t1: 10.3, lines: ["ЗЕМЛЯ"], y: 330, size: 84, color: COLORS.white },
  // Scene 3 — the drop
  { t0: 17.9, t1: 22.0, lines: ["КАПЛЯ"], y: 330, size: 92, color: COLORS.gold, sub: "работает как маленькая линза", stagger: 2.4 },
  // Scene 4 — the hidden world
  { t0: 26.3, t1: 27.9, lines: ["ПРОЖИЛКА"], y: 330, size: 80, color: COLORS.white },
  { t0: 28.7, t1: 30.8, lines: ["СРЕЗ ЛИСТА"], y: 300, size: 74, color: COLORS.white, sub: "увеличенная схема" },
  { t0: 31.5, t1: 35.3, lines: ["КЛЕТКА РАСТЕНИЯ"], y: 260, size: 74, color: COLORS.gold, sub: "увеличенная схема" },
  // Scene 5 — back to the planet, the meaning
  { t0: 43.7, t1: 47.3, lines: ["ЗНАМЕНИЯ", "ДЛЯ РАЗМЫШЛЯЮЩИХ"], y: 300, size: 70, color: COLORS.white, stagger: 0.4,
    sub: "Сура «Аль-Имран», 3:190 · пересказ смысла" },
  // Scene 6 — words from the Qur'an (translation of meaning)
  { t0: 49.6, t1: 54.9, lines: ["«ГОСПОДЬ НАШ!", "ТЫ НЕ СОТВОРИЛ", "ЭТО ПОНАПРАСНУ»"], y: 690, size: 68, color: COLORS.white, stagger: 0.55,
    sub: "Сура «Аль-Имран», 3:191 · часть аята, перевод смысла" },
  // Scene 7 — the question
  { t0: 56.0, t1: 61, lines: ["А ЧТО УДИВИЛО ТЕБЯ?"], y: 300, size: 64, color: COLORS.white },
];
