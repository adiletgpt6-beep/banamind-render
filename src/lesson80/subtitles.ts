// Субтитры 80-1-14: точный текст всех 41 реплики, появляется вместе с речью.
// Длинная реплика делится на последовательные смысловые части по таймингам
// слов; не больше двух строк одновременно. ID, говорящие и ремарки в текст
// не попадают. Вопросы перед интерактивными паузами остаются на экране
// до конца паузы; будущий ответ заранее не показывается.
import type { L80Timeline } from "./timeline";
import { L80_LINES, L80_PAUSES, L80_VIDEO } from "./script";

export type Cue = { from: number; to: number; text: string; lineId: string; hold?: boolean };

const MAX = 46; // символов в части (≈ две строки по 23–40 символов)

const splitText = (text: string): string[] => {
  if (text.length <= MAX) return [text];
  // ищем границу предложения/части ближе к середине
  const mid = text.length / 2;
  let best = -1;
  for (let i = 0; i < text.length; i++) {
    if (/[.:!?]/.test(text[i]) && text[i + 1] === " ") {
      if (best < 0 || Math.abs(i - mid) < Math.abs(best - mid)) best = i;
    }
  }
  if (best < 0) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] === "," && text[i + 1] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
    }
  }
  if (best < 0) return [text];
  return [text.slice(0, best + 1).trim(), text.slice(best + 2).trim()];
};

export const buildCues = (tl: L80Timeline): Cue[] => {
  const fps = L80_VIDEO.fps;
  const cues: Cue[] = [];
  const pauseAfter = new Map<string, number>(L80_PAUSES.map((p) => [p.after, tl.pauses.find((x) => x.after === p.after)!.to]));
  for (const def of L80_LINES) {
    const l = tl.lines[def.id];
    const parts = splitText(def.text);
    const words = l.line.words;
    const start = l.speechFrom - 2;
    const end = l.speechTo + 10;
    if (parts.length === 1 || words.length === 0) {
      cues.push({ from: start, to: end, text: def.text, lineId: def.id });
    } else {
      // граница — начало первого слова второй части
      const nFirst = parts[0].split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
      const w2 = words[Math.min(nFirst, words.length - 1)];
      const cut = l.from + Math.round(w2.start * fps) - 2;
      cues.push({ from: start, to: cut, text: parts[0], lineId: def.id });
      cues.push({ from: cut, to: end, text: parts[1], lineId: def.id });
    }
    // во время паузы вопрос остаётся на экране целиком
    const keep = pauseAfter.get(def.id);
    if (keep) cues.push({ from: end, to: keep, text: def.text, lineId: def.id, hold: true });
  }
  // без наложений: субтитр закрывается до начала следующего
  for (let i = 0; i + 1 < cues.length; i++) cues[i].to = Math.min(cues[i].to, cues[i + 1].from);
  return cues;
};

export const cueAt = (cues: readonly Cue[], f: number): Cue | null => cues.find((c) => f >= c.from && f < c.to) ?? null;
