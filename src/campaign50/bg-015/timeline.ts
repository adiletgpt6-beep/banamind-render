// Шкала BalaGoBG015: сцены идут подряд, их длина подстраивается под
// фактическую длину реплик из озвучки (речь никогда не ускоряется и не
// обрезается). Без озвучки — оценка по тексту (только для превью).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG15_LINES, BG15_SCENES, BG15_VIDEO, type Bg15Line, type Bg15Role, type Bg15SceneId } from "./script.ts";

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export type Char = { readonly c: string; readonly start: number; readonly end: number };

export type ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly text?: string;
  readonly spoken?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Word[];
  readonly chars?: readonly Char[];
  readonly env?: readonly number[];
};

export type Manifest = {
  readonly version: 1;
  readonly kind: "bg15";
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly ManifestLine[];
};

const FPS = BG15_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg15Line): ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Word[] = [];
  const chars: Char[] = [];
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
  return { id: l.id, text: l.text, spoken: l.spoken ?? l.text, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateManifest = (): Manifest => ({ version: 1, kind: "bg15", estimated: true, lines: BG15_LINES.map(estimateLine) });

// Тайминги букв ElevenLabs опережают звук примерно на 65 мс.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (секунды от начала ролика). Совместима по форме
// с Ts2Cue — её понимают персонажи из src/two-schedules-2d/rig.
export type Cue = {
  readonly id: string;
  readonly role: Bg15Role;
  readonly scene: Bg15SceneId;
  readonly file?: string;
  readonly audioFrom: number;
  readonly durationSec: number;
  readonly from: number;
  readonly to: number;
  readonly words: readonly Word[];
  readonly chars: readonly Char[];
  readonly env: readonly number[];
};

export type SceneSpan = { readonly id: Bg15SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Timeline = {
  readonly scenes: readonly SceneSpan[];
  readonly cues: readonly Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly estimated: boolean;
};

const toFrame = (s: number) => Math.round(s * FPS) / FPS;

export const buildTimeline = (m: Manifest): Timeline => {
  const scenes: SceneSpan[] = [];
  const cues: Cue[] = [];
  let t = 0;
  for (const sc of BG15_SCENES) {
    const from = toFrame(t);
    let cur = from;
    let first = true;
    for (const l of BG15_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      const at = toFrame(cur + l.pause);
      const shift = at - ml.speechStart;
      const lag = ml.chars && !m.estimated ? CHAR_LAG : 0;
      const cue: Cue = {
        id: l.id,
        role: l.role,
        scene: sc.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: at,
        to: at + (ml.speechEnd - ml.speechStart),
        words: (est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: c.start + shift + lag, end: c.end + shift + lag })),
        env: est.env ?? [],
      };
      cues.push(cue);
      cur = cue.to;
      first = false;
    }
    const to = toFrame(Math.max(from + sc.minSec, first ? from : cur + sc.tail));
    scenes.push({ id: sc.id, title: sc.title, from, to });
    t = to;
  }
  return { scenes, cues, durationSec: t, frames: Math.round(t * FPS), estimated: Boolean(m.estimated) };
};

// Готовое видео требует все реплики с актуальным текстом и таймингами.
export const requireManifest = (raw: unknown, files?: ReadonlySet<string>): Manifest => {
  if (!raw || typeof raw !== "object") throw new Error("Озвучка BalaGoBG015 не создана.");
  const data = raw as Manifest;
  if (data.version !== 1 || data.kind !== "bg15" || !Array.isArray(data.lines)) throw new Error("Неизвестный формат manifest.json BalaGoBG015.");
  if (data.partial || data.estimated) throw new Error("Озвучка BalaGoBG015 неполная — финальный рендер остановлен.");
  const problems: string[] = [];
  for (const line of BG15_LINES) {
    const matches = data.lines.filter((ml) => ml?.id === line.id);
    const ml = matches[0];
    if (matches.length !== 1 || !ml.file) {
      problems.push(`${line.id}: нет единственной готовой реплики`);
      continue;
    }
    if (ml.text !== line.text || (ml.spoken ?? ml.text) !== (line.spoken ?? line.text)) problems.push(`${line.id}: текст устарел`);
    if (files && !files.has(`${BG15_VIDEO.voiceDir}/${ml.file}`)) problems.push(`${line.id}: нет MP3`);
    if (![ml.speechStart, ml.speechEnd, ml.durationSec].every(Number.isFinite) || ml.speechStart < 0 || ml.speechEnd <= ml.speechStart)
      problems.push(`${line.id}: некорректная длительность`);
    if (!ml.words?.length || !ml.chars?.length || !ml.env?.length) problems.push(`${line.id}: нет фактических таймингов речи`);
  }
  if (problems.length) throw new Error(`Нет полной актуальной озвучки BalaGoBG015: ${problems.join("; ")}`);
  return data;
};

// Секунда, когда звучит слово (первое совпадение по началу слова после
// позиции after); без совпадения — доля fallback длины реплики.
export const wordTime = (cue: Cue, prefix: string, fallback: number, after = 0): number => {
  const p = prefix.toLowerCase();
  const w = cue.words.find((x) => x.start >= after - 0.001 && x.text.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "").startsWith(p));
  return w ? w.start : cue.from + (cue.to - cue.from) * fallback;
};
