// Надписи плаката как геометрия (мм плаката): ширина строк фиксирована
// (textLength), поэтому кончик маркера можно точно вести по буквам —
// надпись появляется только там, где маркер уже прошёл. Без React.
import { POSTER_TITLE, TEXT_CARD, type Vec } from "./layout.ts";
import { POSTER_TEXT } from "./script.ts";

// Ширина заголовка при кегле 50 мм (Nunito 800 ≈ 0,56 em на знак).
export const TITLE_LEN = 586;
export const TITLE_X0 = POSTER_TITLE.cx - TITLE_LEN / 2;
const CAP = POSTER_TITLE.size * 0.7;

// Кончик маркера при доле написанного p (0…1): идёт слева направо, по
// буквам вверх-вниз; на пробелах и тире приподнят (down = false).
export type Tip = { readonly x: number; readonly y: number; readonly down: boolean };

const lineTip = (text: string, p: number, x0: number, len: number, baseline: number, cap: number, wobble: number): Tip => {
  const n = text.length;
  const q = Math.max(0, Math.min(1, p));
  const ci = Math.min(n - 1, Math.floor(q * n));
  const ch = text[ci] ?? " ";
  const within = q * n - ci;
  const gap = ch === " " || ch === "—";
  // внутри буквы: два-три штриха вверх-вниз
  const y = baseline - cap * (0.5 + 0.42 * Math.sin(within * Math.PI * 3 + ci * 1.7)) - (gap ? cap * 0.35 : 0);
  return { x: x0 + q * len + Math.sin(within * Math.PI * 2) * wobble, y, down: !gap && q > 0 && q < 1 };
};

export const titleTip = (p: number): Tip => lineTip(POSTER_TEXT.title, p, TITLE_X0, TITLE_LEN, POSTER_TITLE.baseline, CAP, 2.2);

// Текстовые карточки учителя (мм внутри своей карточки; написаны заранее).
export const TEXT_CARD_FONT = 30;
export const textCardLen = (which: "one" | "two") => (which === "one" ? 172 : 300);
export const textCardSize = (which: "one" | "two"): { readonly w: number; readonly h: number } => ({ w: TEXT_CARD[which].w, h: TEXT_CARD[which].h });
// Центр места текстовой карточки на плакате.
export const textCardSlot = (which: "one" | "two"): Vec => ({ x: TEXT_CARD[which].x + TEXT_CARD[which].w / 2, y: TEXT_CARD[which].y + TEXT_CARD[which].h / 2 });
