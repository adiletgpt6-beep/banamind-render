// Шкала BalaGoBG013: сцены и реплики строятся по фактической озвучке
// (manifest.json). Каждая реплика начинается через lead секунд после начала
// своей сцены (или после предыдущей реплики, afterPrev); сцена длится не
// меньше minSec и не меньше «речь + хвост». Без озвучки — оценка по тексту
// (черновой предпросмотр). Без зависимостей от Remotion.
import { BG13_LINES, BG13_SCENES, BG13_VIDEO, type Bg13Line, type Bg13Role, type Bg13SceneId } from "./script.ts";

export type Bg13Word = { readonly text: string; readonly start: number; readonly end: number };
export type Bg13Char = { readonly c: string; readonly start: number; readonly end: number };

export type Bg13ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg13Word[];
  readonly chars?: readonly Bg13Char[];
  readonly env?: readonly number[];
};

export type Bg13Manifest = {
  readonly version: 1;
  readonly kind: "bg013";
  readonly estimated?: boolean;
  readonly lines: readonly Bg13ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}|\p{N}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg13Line): Bg13ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg13Word[] = [];
  const chars: Bg13Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 14);
    words.push({ text: w, start: t, end: t + d });
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    t += d + (/[.,!?…—:]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  return { id: l.id, durationSec: end + 0.2, speechStart: 0.15, speechEnd: end, words, chars };
};

export const estimateBg13Manifest = (): Bg13Manifest => ({
  version: 1,
  kind: "bg013",
  estimated: true,
  lines: BG13_LINES.map(estimateLine),
});

// Реплика на шкале ролика (абсолютное время, с).
export type Bg13Cue = {
  readonly id: string;
  readonly role: Bg13Role;
  readonly scene: Bg13SceneId;
  readonly text: string;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  // слова субтитров (текст сценария) с временем по фактической речи
  readonly words: readonly Bg13Word[];
  // буквы (абс. время) и огибающая громкости файла по кадрам — для губ
  readonly chars: readonly Bg13Char[];
  readonly env: readonly number[];
};

export type Bg13Scene = { readonly id: Bg13SceneId; readonly from: number; readonly to: number };

export type Bg13Timeline = {
  readonly scenes: readonly Bg13Scene[];
  readonly cues: readonly Bg13Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly ctaFrom: number;
};

const r3 = (x: number) => Math.round(x * 1000) / 1000;

// Слова субтитров берутся из текста сценария (BalaGo, цифры номера);
// время — по фактическим словам озвучки (пропорционально, если число слов
// в тексте и в произнесённом варианте различается).
const subtitleWords = (l: Bg13Line, ml: Bg13ManifestLine, shift: number): Bg13Word[] => {
  const shown = l.text.split(/\s+/).filter((w) => [...w].some(isLetter));
  const spoken = ml.words?.length ? ml.words : estimateLine(l).words!;
  const a = spoken[0].start;
  const b = spoken[spoken.length - 1].end;
  if (shown.length === spoken.length) return shown.map((text, i) => ({ text, start: spoken[i].start + shift, end: spoken[i].end + shift }));
  const per = (b - a) / shown.length;
  return shown.map((text, i) => ({ text, start: a + i * per + shift, end: a + (i + 1) * per + shift }));
};

export const buildBg13Timeline = (m: Bg13Manifest): Bg13Timeline => {
  const scenes: Bg13Scene[] = [];
  const cues: Bg13Cue[] = [];
  let t = 0;
  for (const s of BG13_SCENES) {
    const from = t;
    let speechEnd = from;
    for (const l of BG13_LINES.filter((x) => x.scene === s.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const start = (l.afterPrev ? speechEnd : from) + l.lead;
      const dur = ml.speechEnd - ml.speechStart;
      const shift = start - ml.speechStart;
      const chars = ml.chars?.length ? ml.chars : estimateLine(l).chars!;
      cues.push({
        id: l.id,
        role: l.role,
        scene: s.id,
        text: l.text,
        file: ml.file,
        audioFrom: r3(shift),
        durationSec: ml.durationSec,
        from: r3(start),
        to: r3(start + dur),
        words: subtitleWords(l, ml, shift),
        chars: chars.map((c) => ({ c: c.c, start: c.start + shift, end: c.end + shift })),
        env: ml.env ?? [],
      });
      speechEnd = start + dur;
    }
    // длительность сцены — целое число кадров
    const len = Math.max(s.minSec, speechEnd - from + s.tailSec);
    t = Math.ceil((from + len) * BG13_VIDEO.fps - 1e-6) / BG13_VIDEO.fps;
    scenes.push({ id: s.id, from: r3(from), to: r3(t) });
  }
  const frames = Math.round(t * BG13_VIDEO.fps);
  return { scenes, cues, durationSec: frames / BG13_VIDEO.fps, frames, ctaFrom: scenes.find((s) => s.id === "cta")!.from };
};

export const sceneOf = (tl: Bg13Timeline, id: Bg13SceneId) => tl.scenes.find((s) => s.id === id)!;
export const cueOf = (tl: Bg13Timeline, id: string) => tl.cues.find((c) => c.id === id)!;

// Время (абс., с) начала слова реплики, начинающегося с prefix (без учёта
// регистра); если не найдено — доля fallback от длины реплики.
export const wordTime = (c: Bg13Cue, prefix: string, fallback: number, nth = 0) => {
  const p = prefix.toLowerCase();
  const hits = c.words.filter((w) => w.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return hits[nth]?.start ?? c.from + (c.to - c.from) * fallback;
};

// Проверка шкалы: финал держится ≥ 3 с после последнего слова, контакты
// видны ≥ 5 с, реплики не накладываются, ролик 55–80 с.
export const checkBg13Timeline = (tl: Bg13Timeline): string[] => {
  const problems: string[] = [];
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec - last.to < 3) problems.push(`после последнего слова ${(tl.durationSec - last.to).toFixed(2)} с (нужно ≥ 3 с)`);
  if (tl.durationSec - tl.ctaFrom < 8) problems.push(`финальный экран ${(tl.durationSec - tl.ctaFrom).toFixed(2)} с (нужно ≥ 8 с)`);
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to + 0.3 > next.from) problems.push(`${c.id}: речь до ${c.to.toFixed(2)} с наезжает на ${next.id}`);
    const s = sceneOf(tl, c.scene);
    if (c.to > s.to - 0.3) problems.push(`${c.id}: речь выходит за сцену ${s.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  if (tl.durationSec < 55 || tl.durationSec > 80) problems.push(`длительность ${tl.durationSec.toFixed(2)} с вне 55–80 с`);
  return problems;
};
