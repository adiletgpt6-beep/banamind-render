// Раскладка субтитров LIVE-005: типы и геометрия групп. Без импортов Remotion —
// модуль читают Node-тесты (зоны, лицо, безопасные области Reels).
import type { LiveWord } from "../../live/sync";
import { FONT_ADVANCE } from "./font-metrics.ts";

export type EdGroup = {
  readonly from: number; // индекс первого слова
  readonly to: number; // индекс последнего (включительно)
  readonly x: number; // опорная точка, px кадра 1080×1920
  readonly y: number; // центр блока по вертикали
  readonly align: "left" | "center" | "right";
  readonly big?: readonly number[]; // смысловые слова — крупно (Black Italic)
  readonly accent?: readonly number[]; // жёлтым
  readonly breakAfter?: readonly number[]; // перенос после слова
  readonly size?: number; // мелкий кегль
  readonly bigSize?: number; // крупный кегль
  readonly endAt?: number; // принудительный конец, с
  readonly strike?: { readonly words: readonly number[]; readonly at: number }; // перечеркнуть строку
  readonly keepCase?: readonly number[]; // крупные слова без заглавных (BalaGo, WhatsApp)
  readonly haze?: number; // мягкая тёмная дымка под блоком на светлом фоне (0–1), не плашка
  readonly brackets?: { readonly at: number }; // жёлтые скобки по краям, сжимаются в момент at
  // Слот на экране: группа уходит, когда в ТОТ ЖЕ слот входит следующая группа
  // (по умолчанию все в одном слоте). Две группы в разных слотах видны вместе.
  readonly slot?: string;
  readonly holdUntil?: number; // держать до (с), пока в слот не войдёт следующая группа
};

export const LEAD = 0.07; // слово появляется чуть раньше звука — глаз успевает
export const SMALL = 54; // Montserrat Bold
export const BIG = 84; // Montserrat Black Italic
export const LINE = 1.08;

export const sizeOf = (g: EdGroup, i: number) => (g.big?.includes(i) ? (g.bigSize ?? BIG) : (g.size ?? SMALL));

export const linesOf = (g: EdGroup) => {
  const lines: number[][] = [[]];
  for (let i = g.from; i <= g.to; i++) {
    lines[lines.length - 1].push(i);
    if (g.breakAfter?.includes(i) && i < g.to) lines.push([]);
  }
  return lines;
};

// Окно группы. Появляется к первому слову; уходит одновременно со входом
// следующей группы («лента»: старая строка уезжает вверх за маску, новая
// выезжает снизу) или через 0,9 с после последнего слова. Группа живёт только
// внутри своего плана: не раньше склейки перед первым словом и не позже
// следующей склейки (cuts — склейки исходника).
export const EXIT = 0.16;
const startOf = (words: readonly LiveWord[], g: EdGroup) => words[g.from].start - LEAD - 0.05;
export const groupWindow = (words: readonly LiveWord[], groups: readonly EdGroup[], i: number, cuts: readonly number[] = []) => {
  const g = groups[i];
  const first = words[g.from].start;
  const shotStart = Math.max(0, ...cuts.filter((c) => c <= first + 1e-6));
  const shotEnd = Math.min(Infinity, ...cuts.filter((c) => c > first + 1e-6));
  const start = Math.max(startOf(words, g), shotStart + 0.03);
  const after = groups.slice(i + 1).find((x) => (x.slot ?? "main") === (g.slot ?? "main"));
  const next = after ? Math.max(startOf(words, after), shotStart + 0.03) + EXIT - 0.02 : Infinity;
  const natural = Math.min(next, words[g.to].end + 0.9);
  const held = Math.max(natural, Math.min(g.holdUntil ?? -Infinity, next));
  const end = Math.min(g.endAt ?? Infinity, held, shotEnd - 0.02);
  return { start, end };
};

// Сколько секунд слово стоит неподвижно и полностью (после въезда, до ухода).
export const wordHold = (words: readonly LiveWord[], groups: readonly EdGroup[], i: number, w: number, cuts: readonly number[] = []) => {
  const { end } = groupWindow(words, groups, i, cuts);
  const line = linesOf(groups[i]).findIndex((l) => l.includes(w));
  return end - EXIT + line * 0.03 - (words[w].start - LEAD + 0.24);
};

// Размер блока по реальным ширинам знаков Montserrat (font-metrics.ts) — для
// тестов зон: лицо, жесты, безопасная область Reels, светлые фасады.
const caseOf = (g: EdGroup, i: number, text: string) => (g.big?.includes(i) && !g.keepCase?.includes(i) ? text.toUpperCase() : text);
export const wordWidth = (g: EdGroup, words: readonly LiveWord[], i: number) => {
  const big = g.big?.includes(i) ?? false;
  const table = FONT_ADVANCE[big ? "blackItalic" : "bold"];
  const text = caseOf(g, i, words[i].text);
  const em = [...text].reduce((w, c) => w + (table[c] ?? 0.7), 0) + (big ? -1 : 0.3) * text.length / sizeOf(g, i);
  return em * sizeOf(g, i);
};
export const GAP = SMALL * 0.28;
export const lineWidth = (g: EdGroup, words: readonly LiveWord[], line: readonly number[]) =>
  line.reduce((w, i) => w + wordWidth(g, words, i), 0) + (line.length - 1) * GAP;

export const blockRect = (g: EdGroup, words: readonly LiveWord[]) => {
  const lines = linesOf(g);
  const h = lines.reduce((s, line) => s + Math.max(...line.map((i) => sizeOf(g, i))) * LINE, 0);
  const w = Math.max(...lines.map((line) => lineWidth(g, words, line)));
  const left = g.align === "left" ? g.x : g.align === "center" ? g.x - w / 2 : g.x - w;
  return { left, right: left + w, top: g.y - h / 2, bottom: g.y + h / 2 };
};
