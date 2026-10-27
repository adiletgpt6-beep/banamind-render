// Субтитры: короткие фразы по фактическим таймингам слов, максимум две
// строки до ~42 символов. Одна функция строит и экранные субтитры,
// и файлы SRT/VTT (scripts/finance/captions.mjs) — тексты совпадают.
import type { Timeline } from "./timeline";

export type Caption = { from: number; to: number; lines: string[]; lineId: string };

const MAX_LINE = 42;
const MAX_CHARS = 80;

const splitTwo = (words: string[]): string[] => {
  const text = words.join(" ");
  if (text.length <= MAX_LINE) return [text];
  // ближе к середине, предпочитая разрыв после знака препинания
  let best = 1;
  let bestScore = Infinity;
  for (let i = 1; i < words.length; i++) {
    const a = words.slice(0, i).join(" ");
    const b = words.slice(i).join(" ");
    if (a.length > MAX_LINE + 4 || b.length > MAX_LINE + 4) continue;
    const score = Math.abs(a.length - b.length) - (/[,.;:—!?]$/.test(words[i - 1]) ? 12 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
};

export const buildCaptions = (tl: Timeline): Caption[] => {
  const out: Caption[] = [];
  for (const ln of tl.lines) {
    // слова берутся из текста сценария (с пунктуацией), время — из озвучки
    const textWords = ln.text.split(/\s+/).filter(Boolean);
    const timed = ln.words;
    const n = Math.min(textWords.length, timed.length);
    if (n === 0) continue;
    let chunk: number[] = [];
    const flush = () => {
      if (!chunk.length) return;
      const a = chunk[0];
      const b = chunk[chunk.length - 1];
      const words = chunk.map((i) => textWords[i]);
      // последний фрагмент реплики забирает оставшиеся слова текста
      if (b === n - 1 && textWords.length > n) words.push(...textWords.slice(n));
      out.push({ from: timed[a].start, to: timed[b].end, lines: splitTwo(words), lineId: ln.id });
      chunk = [];
    };
    for (let i = 0; i < n; i++) {
      const len = chunk.map((k) => textWords[k]).join(" ").length;
      if (chunk.length && len + 1 + textWords[i].length > MAX_CHARS) flush();
      chunk.push(i);
      const w = textWords[i];
      const len2 = chunk.map((k) => textWords[k]).join(" ").length;
      // предложение закончилось — новый фрагмент, если текущий не крошечный
      if (/[.!?]$/.test(w) && len2 > 18) flush();
      else if (/[,;:—]$/.test(w) && len2 > 52) flush();
    }
    flush();
  }
  // показ держится до следующего фрагмента (но не дольше 0.8 с после речи)
  for (let i = 0; i < out.length; i++) {
    const next = out[i + 1];
    const hold = out[i].to + 0.8;
    out[i].to = next ? Math.min(hold, next.from - 0.02) : hold;
  }
  return out;
};

const pad = (n: number, w = 2) => String(n).padStart(w, "0");
const stamp = (t: number, sep: "," | ".") => {
  const ms = Math.round(t * 1000);
  return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}${sep}${pad(ms % 1000, 3)}`;
};

export const toSrt = (caps: Caption[]) =>
  caps.map((c, i) => `${i + 1}\n${stamp(c.from, ",")} --> ${stamp(c.to, ",")}\n${c.lines.join("\n")}\n`).join("\n");

export const toVtt = (caps: Caption[]) =>
  "WEBVTT\n\n" + caps.map((c) => `${stamp(c.from, ".")} --> ${stamp(c.to, ".")}\n${c.lines.join("\n")}\n`).join("\n");
