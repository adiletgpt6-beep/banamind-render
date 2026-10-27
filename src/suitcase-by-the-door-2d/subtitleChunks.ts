// Деление субтитров на порции и строки — общий код для кадра
// (Subtitles.tsx) и для SRT (scripts/sd2d-deliverables.mjs), чтобы
// экранные субтитры и файл SRT совпадали. Без зависимостей от Remotion.
export const LINE_CHARS = 26; // символов в строке при 54 px
export const MAX_WORDS = 7;

// Деление реплики на порции: по знакам препинания, затем по числу слов и
// длине строки. Возвращает индексы слов [from, to) для каждой порции.
export const chunkWords = (text: string): [number, number][] => {
  const words = text.split(/\s+/).filter(Boolean);
  const out: [number, number][] = [];
  let start = 0;
  const len = (a: number, b: number) => words.slice(a, b).join(" ").length;
  for (let i = 0; i < words.length; i++) {
    const end = i + 1;
    const punct = /[.!?…:]$/.test(words[i]) || (/[,—]$/.test(words[i]) && end - start >= 3);
    // союз «же» («или») начинает новую порцию, если в текущей уже 3+ слова
    const beforeOr = words[i + 1] === "же" && end - start >= 3;
    const tooLong = end - start >= MAX_WORDS || len(start, end + 1) > LINE_CHARS * 2 - 4;
    if (punct || beforeOr || tooLong || end === words.length) {
      out.push([start, end]);
      start = end;
    }
  }
  // короткий хвост (1 слово) присоединяется к предыдущей порции, если влезает
  for (let k = out.length - 1; k > 0; k--) {
    const [a, b] = out[k];
    const [pa] = out[k - 1];
    if (b - a === 1 && len(pa, b) <= LINE_CHARS * 2 - 2) {
      out[k - 1] = [pa, b];
      out.splice(k, 1);
    }
  }
  return out;
};

// Разбить порцию на 1–2 строки, не оставляя короткое слово в одиночестве.
export const twoLines = (ws: readonly string[]): string[][] => {
  const full = ws.join(" ");
  if (full.length <= LINE_CHARS) return [[...ws]];
  let best = 1;
  let bestScore = Infinity;
  for (let k = 1; k < ws.length; k++) {
    const a = ws.slice(0, k).join(" ").length;
    const b = ws.slice(k).join(" ").length;
    const lonely = (k === 1 && ws[0].length <= 3) || (k === ws.length - 1 && ws[k].length <= 3) ? 40 : 0;
    const score = Math.max(a, b) + lonely;
    if (score < bestScore) {
      bestScore = score;
      best = k;
    }
  }
  return [ws.slice(0, best), ws.slice(best)];
};

// Индекс слова озвучки для слова экранного текста. Слова озвучки — токены
// spoken с буквами (тире и т. п. в тайминги не попадают); на экране словом
// считается токен с буквой или цифрой (номер «0998» в spoken записан словами
// через дефис — один токен). Поэтому «—» на экране слова не сдвигает.
export const spokenIndex = (text: string, a: number): number =>
  text
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, a)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
