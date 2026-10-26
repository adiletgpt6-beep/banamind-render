// Геометрия карточки с ответом (единицы карточки 300 × 200) — общая для
// хореографии (кончик карандаша), стейджа (рисунок на столе) и вида сверху.
// Текст набирается шрифтом с кириллицей; ширина строки фиксируется
// (textLength), поэтому положение кончика карандаша и граница проявления
// строки считаются из доли написанного детерминированно.
import { CARD_LINES } from "./script.ts";

export const CARD_UNITS = { w: 300, h: 200 } as const;
export const CARD_FONT = 33;
const X0 = 22;
const LINES = CARD_LINES.map((text, i) => ({ text, n: [...text].length, x: X0, y: i === 0 ? 86 : 148 }));
const N1 = LINES[0].n;
const N2 = LINES[1].n;
// ширина строк: ≈ 0,5 em на знак (Nunito 700), фиксируется атрибутом textLength
export const CARD_LINE_LEN: readonly [number, number] = [Math.round(N1 * CARD_FONT * 0.485), Math.round(N2 * CARD_FONT * 0.485)];
export const CARD_LAYOUT = LINES.map((l, i) => ({ ...l, len: CARD_LINE_LEN[i] }));
const SPLIT = N1 / (N1 + N2);

export type CardTip = { readonly x: number; readonly y: number; readonly lift: number; readonly line: number; readonly frac: number };

// Положение кончика карандаша по доле написанного p ∈ [0, 1]; lift — карандаш
// приподнят (между словами и при переходе на вторую строку).
export const cardTip = (p: number): CardTip => {
  const u = Math.max(0, Math.min(1, p));
  const line = u < SPLIT ? 0 : 1;
  const frac = line === 0 ? u / SPLIT : (u - SPLIT) / (1 - SPLIT);
  const L = CARD_LAYOUT[line];
  const chars = [...L.text];
  const pos = frac * L.n;
  const idx = Math.min(L.n - 1, Math.floor(pos));
  let lift = 0;
  // пробел: карандаш поднят; плавный подъём/опускание вокруг пробела
  for (let i = 0; i < L.n; i++) {
    if (chars[i] !== " ") continue;
    const d = Math.abs(pos - (i + 0.5));
    lift = Math.max(lift, Math.max(0, 1 - d / 0.9));
  }
  if (line === 1 && frac < 0.04) lift = Math.max(lift, 1 - frac / 0.04);
  if (u >= 1) lift = 1;
  void idx;
  return { x: L.x + L.len * frac, y: L.y, lift, line, frac };
};

// Сколько каждой строки проявлено (ширина в единицах карточки).
export const cardReveal = (p: number): readonly [number, number] => {
  const u = Math.max(0, Math.min(1, p));
  if (u <= 0) return [0, 0];
  if (u < SPLIT) return [CARD_LAYOUT[0].len * (u / SPLIT), 0];
  return [CARD_LAYOUT[0].len, CARD_LAYOUT[1].len * ((u - SPLIT) / (1 - SPLIT))];
};
