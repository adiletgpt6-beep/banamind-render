// Титры BanaMind из реальных таймкодов озвучки.
//
// 1. Время каждого слова — по посимвольному выравниванию озвучки (ElevenLabs
//    with-timestamps: буквы сказанного текста ↔ буквы текста титров), а не по
//    средней скорости чтения. Ударения и тире в тексте произношения не мешают:
//    сравниваются только буквы.
// 2. Реплика делится на короткие смысловые фразы: конец предложения, запятая/тире,
//    пауза в речи; не больше двух строк; служебное слово не висит в конце строки.
// 3. Выделения: важные слова (жёлтый), особо значимые понятия (акцент книги),
//    редкие кинетические слова (крупно, не чаще раза в 45 с). Не больше двух
//    выделений на титр.
// Один и тот же расчёт используют кадр (BanaMindAnimatedCaptions) и SRT.
import { CAPTION_STYLE, type CaptionStyle } from "./style.ts";

export type SpokenWord = { text: string; start: number; end: number };
export type SpokenChar = { c: string; start: number; end: number };
export type SpokenLine = {
  id: string;
  text: string; // текст титров (как в сценарии)
  words: SpokenWord[]; // слова с таймкодами (запасной вариант)
  chars?: SpokenChar[]; // буквы озвучки с таймкодами (основной источник)
  speechFrom: number;
  speechTo: number;
  holdUntil?: number; // титр должен исчезнуть до этого момента (например, карточка вопроса)
};

// 0 — обычное, 1 — важное (жёлтый), 2 — особо значимое (акцент), 3 — кинетическое
export type Emph = 0 | 1 | 2 | 3;
export type CaptionWord = { text: string; start: number; end: number; emph: Emph; pop: boolean };
export type CaptionCue = {
  start: number;
  end: number;
  rows: CaptionWord[][];
  mode: "words" | "phrase"; // по словам в ритме речи или фраза целиком (slide + fade)
  lineId: string;
  text: string;
};

// Настройки книги: словарь выделений и кинетические моменты.
export type CaptionBook = {
  accent?: string; // цвет «особо значимых» слов для этой книги
  highlight: string[]; // основы важных слов (строчные, ё → е); «=слово» — точное совпадение
  accentTerms: string[]; // основы особо значимых понятий
  calm: string[]; // выделяются цветом, но без увеличения (например, имена Бога)
  kinetic: { line: string; words: string[] }[]; // слова реплики для кинетической типографики
  never?: string[]; // слова, которые не выделять
  // сцены, где внизу важные подписи схемы: титры ниже (px от низа кадра)
  lowScenes?: Record<string, number>;
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}-]/gu, "");
const letters = (s: string) => s.toLowerCase().replace(/ё/g, "е").replace(/[^\p{L}]/gu, "");
const WEAK = new Set(["в", "во", "и", "с", "со", "к", "ко", "о", "об", "у", "а", "но", "на", "не", "ни", "по", "за", "из", "от", "до", "для", "без", "под", "над", "при", "про", "что", "как", "или", "же", "бы", "ли", "это", "то", "его", "её", "их"]);
const CLITIC = new Set(["бы", "б", "же", "ж", "ли", "ль"]);
const isWeak = (tok: string) => /\p{L}$/u.test(tok) && WEAK.has(norm(tok));
const endsSentence = (tok: string) => /[.!?…]["»)]*$/.test(tok);
const endsClause = (tok: string) => /[,;:]["»)]*$/.test(tok);

// Таймкоды слов: буквы текста ↔ буквы озвучки по порядку.
export const timeWords = (ln: SpokenLine): SpokenWord[] => {
  const tokens = ln.text.split(/\s+/).filter(Boolean);
  const chars = (ln.chars ?? []).map((c) => ({ ...c, c: letters(c.c) })).filter((c) => c.c.length > 0);
  const want = tokens.map(letters);
  const total = want.reduce((a, w) => a + w.length, 0);
  if (chars.length === total && total > 0) {
    let mismatch = 0;
    let p = 0;
    const out: SpokenWord[] = [];
    tokens.forEach((tok, i) => {
      const n = want[i].length;
      if (!n) {
        // знак без букв («—») появляется вместе с предыдущим словом
        const prev = out[out.length - 1];
        out.push({ text: tok, start: prev ? prev.end : ln.speechFrom, end: prev ? prev.end : ln.speechFrom });
        return;
      }
      for (let k = 0; k < n; k++) if (chars[p + k].c !== want[i][k]) mismatch++;
      out.push({ text: tok, start: chars[p].start, end: chars[p + n - 1].end });
      p += n;
    });
    if (mismatch <= Math.max(2, total * 0.03)) return out;
  }
  if (ln.words.length === tokens.length) return tokens.map((t, i) => ({ text: t, start: ln.words[i].start, end: ln.words[i].end }));
  // крайний случай: пропорционально длине (не используется, если есть озвучка)
  const span = ln.speechTo - ln.speechFrom;
  let acc = 0;
  return tokens.map((t) => {
    const s = ln.speechFrom + (span * acc) / ln.text.length;
    acc += t.length + 1;
    return { text: t, start: s, end: ln.speechFrom + (span * acc) / ln.text.length };
  });
};

const match = (word: string, list: string[]) => {
  const w = norm(word);
  if (!w) return false;
  return list.some((s) => (s.charAt(0) === "=" ? w === s.slice(1) : w.indexOf(s) === 0));
};

// «ширина» слова в знаках с учётом кинетического увеличения и заглавных
const widthOf = (w: { text: string; emph: Emph }, st: CaptionStyle) => (w.emph === 3 ? w.text.length * st.kineticSize * 1.15 : w.emph ? w.text.length * st.pop : w.text.length);
const rowWidth = (ws: { text: string; emph: Emph }[], st: CaptionStyle) => ws.reduce((a, w) => a + widthOf(w, st), 0) + Math.max(0, ws.length - 1);

// Перенос на ≤ maxRows строк: строки по возможности равной длины,
// служебное слово не остаётся в конце строки, перенос после знака препинания лучше.
export const wrapRows = <T extends { text: string; emph: Emph }>(ws: T[], st: CaptionStyle = CAPTION_STYLE, strict = true): T[][] | null => {
  if (rowWidth(ws, st) <= st.maxRowChars) return [ws];
  if (st.maxRows < 2) return null;
  let best: T[][] | null = null;
  let bestScore = Infinity;
  for (let i = 1; i < ws.length; i++) {
    const a = ws.slice(0, i);
    const b = ws.slice(i);
    const wa = rowWidth(a, st);
    const wb = rowWidth(b, st);
    if (wa > st.maxRowChars || wb > st.maxRowChars) continue;
    let score = Math.abs(wa - wb);
    if (isWeak(a[a.length - 1].text)) {
      if (strict) continue; // «в», «и», «с»… не остаются в конце строки
      score += 30;
    }
    if (b[0].text === "—" && strict) continue; // тире не начинает строку
    if (CLITIC.has(norm(b[0].text))) score += 30; // «бы», «же», «ли» держатся за предыдущее слово
    if (/^«[^»]*$/.test(a[a.length - 1].text)) score += 25; // не рвать сразу после открытой кавычки
    if (endsClause(a[a.length - 1].text) || endsSentence(a[a.length - 1].text) || a[a.length - 1].text === "—") score -= 8;
    if (b.length === 1 && b[0].text.length < 6) score += 20;
    if (score < bestScore) {
      bestScore = score;
      best = [a, b];
    }
  }
  return best;
};

// Стоимость фразы-титра: валидность (≤ 2 строк), естественная граница в конце.
const pieceCost = <T extends SpokenWord & { emph: Emph }>(seg: T[], i: number, j: number, st: CaptionStyle): number => {
  const piece = seg.slice(i, j);
  let cost = 12;
  if (!wrapRows(piece, st)) {
    if (!wrapRows(piece, st, false)) return Infinity;
    cost += 40;
  }
  const last = piece[piece.length - 1];
  const w = rowWidth(piece, st);
  if (j < seg.length) {
    const next = seg[j];
    if (isWeak(last.text)) cost += 40;
    if (next.text === "—") cost += 30;
    if (endsClause(last.text) || last.text === "—") cost -= 8;
    if (next.start - last.end >= st.pauseBreak) cost -= 8;
    if (w < 14) cost += (14 - w) * 1.5; // слишком короткий кусок — дёргано
  } else if (piece.length === 1 && i > 0) cost += 25; // одно слово-сирота в конце
  return cost;
};

const splitSentence = <T extends SpokenWord & { emph: Emph }>(seg: T[], st: CaptionStyle): T[][] => {
  const n = seg.length;
  const best: number[] = [0];
  const prev: number[] = [0];
  for (let j = 1; j <= n; j++) {
    best[j] = Infinity;
    prev[j] = 0;
    for (let i = Math.max(0, j - 24); i < j; i++) {
      const c = best[i] + pieceCost(seg, i, j, st);
      if (c < best[j]) {
        best[j] = c;
        prev[j] = i;
      }
    }
  }
  const out: T[][] = [];
  for (let j = n; j > 0; j = prev[j]) out.unshift(seg.slice(prev[j], j));
  return out;
};

type Tok = SpokenWord & { emph: Emph; pop: boolean };

export const buildCaptionCues = (lines: SpokenLine[], book: CaptionBook, st: CaptionStyle = CAPTION_STYLE): CaptionCue[] => {
  const cues: CaptionCue[] = [];
  let lastKinetic = -Infinity;
  for (const ln of lines) {
    const kin = book.kinetic.filter((k) => k.line === ln.id);
    const toks: Tok[] = timeWords(ln).map((w) => {
      let emph: Emph = 0;
      let pop = false;
      const never = book.never && match(w.text, book.never);
      if (!never && kin.some((k) => k.words.some((x) => norm(x) === norm(w.text))) && w.start - lastKinetic >= st.kineticMinGap) emph = 3;
      else if (!never && match(w.text, book.calm)) emph = 2;
      else if (!never && match(w.text, book.accentTerms)) {
        emph = 2;
        pop = true;
      } else if (!never && match(w.text, book.highlight)) {
        emph = 1;
        pop = true;
      }
      return { ...w, emph, pop };
    });
    // кинетические слова одной фразы считаются одним моментом
    const kt = toks.filter((t) => t.emph === 3);
    if (kt.length) lastKinetic = kt[kt.length - 1].start;

    // разбиение на фразы: каждое предложение делится оптимально (меньше титров,
    // границы на паузах и знаках препинания, без висящих служебных слов и сирот)
    const groups: Tok[][] = [];
    let from = 0;
    toks.forEach((tk, i) => {
      if (endsSentence(tk.text) || i === toks.length - 1) {
        groups.push(...splitSentence(toks.slice(from, i + 1), st));
        from = i + 1;
      }
    });
    for (const g of groups) {
      // не больше maxHighlightsPerCue выделений (кинетика всегда остаётся)
      let budget = st.maxHighlightsPerCue - g.filter((t) => t.emph === 3).length;
      const order = [2, 1] as const;
      for (const level of order)
        for (const t of g)
          if (t.emph === level) {
            if (budget > 0) budget--;
            else {
              t.emph = 0;
              t.pop = false;
            }
          }
      const rows = wrapRows(g, st) ?? wrapRows(g, st, false) ?? [g];
      const words: CaptionWord[][] = rows.map((r) => r.map((t) => ({ text: t.text, start: t.start, end: t.end, emph: t.emph, pop: t.pop })));
      const hasKinetic = g.some((t) => t.emph === 3);
      cues.push({
        start: g[0].start - st.lead,
        end: Math.min(g[g.length - 1].end + st.hold, ln.holdUntil ?? Infinity),
        rows: words,
        mode: g.length <= st.phraseMaxWords && !hasKinetic ? "phrase" : "words",
        lineId: ln.id,
        text: g.map((t) => t.text).join(" "),
      });
    }
  }
  cues.sort((a, b) => a.start - b.start);
  // титры не перекрываются: каждый уходит до появления следующего
  cues.forEach((c, i) => {
    const next = cues[i + 1];
    if (next) c.end = Math.min(c.end, next.start - st.gapBefore);
    c.start = Math.max(0, c.start);
    if (c.end < c.start + 0.3) c.end = Math.min(c.start + 0.3, next ? next.start - st.gapBefore : Infinity);
  });
  return cues;
};
