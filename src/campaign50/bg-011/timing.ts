// Шкала BalaGoBG011. Сцены идут подряд; реплика начинается в момент
// at (от начала своей сцены), но не раньше чем через gap после конца
// предыдущей. Длительность реплики — из файла озвучки (manifest.json);
// если речь длиннее, сцена растягивается (tail после последней реплики).
// Так реплика никогда не обрезается и не ускоряется.
// Без озвучки — оценка по тексту (для превью в Studio; финальный рендер
// без голоса запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG11_LINES, BG11_SCENES, BG11_VIDEO, type Bg11Line, type Bg11SceneId } from "./script.ts";

export type Bg11Word = { readonly text: string; readonly start: number; readonly end: number };
export type Bg11Char = { readonly c: string; readonly start: number; readonly end: number };

export type Bg11ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg11Word[];
  readonly chars?: readonly Bg11Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Bg11Manifest = {
  readonly version: 1;
  readonly kind: "bg011";
  readonly estimated?: boolean;
  readonly lines: readonly Bg11ManifestLine[];
};

const FPS = BG11_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg11Line): Bg11ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg11Word[] = [];
  const chars: Bg11Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg11Manifest = (): Bg11Manifest => ({
  version: 1,
  kind: "bg011",
  estimated: true,
  lines: BG11_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type Bg11Cue = {
  readonly id: string;
  readonly role: Bg11Line["role"];
  readonly scene: Bg11SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла (с, от начала ролика)
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Bg11Word[];
  readonly chars: readonly Bg11Char[];
  readonly env: readonly number[];
};

export type Bg11Scene = {
  readonly id: Bg11SceneId;
  readonly title: string;
  readonly from: number; // кадр ролика
  readonly frames: number;
};

export type Bg11Timeline = {
  readonly scenes: readonly Bg11Scene[];
  readonly cues: readonly Bg11Cue[];
  readonly frames: number;
  readonly speechEnd: number; // конец последней реплики, с
};

export const buildBg11Timeline = (m: Bg11Manifest): Bg11Timeline => {
  const scenes: Bg11Scene[] = [];
  const cues: Bg11Cue[] = [];
  let start = 0; // начало сцены, кадры
  let prevEnd = -Infinity; // конец предыдущей реплики, с
  for (const sc of BG11_SCENES) {
    const s0 = start / FPS;
    let lastEnd = s0;
    for (const l of BG11_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const from = Math.max(s0 + l.at, prevEnd + (l.gap ?? 0.3));
      const to = from + (ml.speechEnd - ml.speechStart);
      const shift = from - ml.speechStart;
      const lag = ml.chars ? CHAR_LAG : 0;
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
        env: est.env ?? [],
      });
      prevEnd = to;
      lastEnd = to;
    }
    let frames = Math.round(Math.max(sc.len, lastEnd - s0 + sc.tail) * FPS);
    // финал: общая длительность не короче minSec
    if (sc.id === "cta") frames = Math.max(frames, Math.round(BG11_VIDEO.minSec * FPS) - start);
    scenes.push({ id: sc.id, title: sc.title, from: start, frames });
    start += frames;
  }
  return { scenes, cues, frames: start, speechEnd: prevEnd };
};

// Проверка шкалы: файл не начинается раньше 0 с, речь не выходит за свою
// сцену, ролик не длиннее maxSec, после последнего слова ≥ 3 с.
export const checkBg11Timeline = (tl: Bg11Timeline): string[] => {
  const problems: string[] = [];
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.to * FPS > sc.from + sc.frames - 6) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  }
  const total = tl.frames / FPS;
  if (total > BG11_VIDEO.maxSec) problems.push(`ролик ${total.toFixed(1)} с длиннее ${BG11_VIDEO.maxSec} с`);
  if (total - tl.speechEnd < 3) problems.push(`после последнего слова только ${(total - tl.speechEnd).toFixed(2)} с`);
  return problems;
};

export const sceneOf = (tl: Bg11Timeline, id: Bg11SceneId) => tl.scenes.find((s) => s.id === id)!;
