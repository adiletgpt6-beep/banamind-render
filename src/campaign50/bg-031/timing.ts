// Шкала BalaGoBG031 (по образцу проверенной шкалы BG-022). Сцены идут
// подряд; реплика начинается в момент at (от начала своей сцены), но не
// раньше чем через gap после конца предыдущей. Длительность реплики — из
// файла озвучки (manifest.json); если речь длиннее, сцена растягивается
// (tail после последней реплики). Так реплика никогда не обрезается и не
// ускоряется.
// Без озвучки — оценка по тексту (для превью; финальный рендер без голоса
// запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG31_LINES, BG31_SCENES, BG31_VIDEO, type Bg31Line, type Bg31SceneId } from "./script.ts";

export type Bg31Word = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
};
export type Bg31Char = {
  readonly c: string;
  readonly start: number;
  readonly end: number;
};

export type Bg31ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg31Word[];
  readonly chars?: readonly Bg31Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1.
  readonly env?: readonly number[];
};

export type Bg31Manifest = {
  readonly version: 1;
  readonly kind: "bg031";
  readonly estimated?: boolean;
  readonly lines: readonly Bg31ManifestLine[];
};

const FPS = BG31_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 12,5 букв в секунду (замер голоса KG-teacher), паузы на знаках
// препинания.
export const estimateLine = (l: Bg31Line): Bg31ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg31Word[] = [];
  const chars: Bg31Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 12.5);
    letters.forEach((c, i) =>
      chars.push({
        c: c.toLowerCase(),
        start: t + (i * d) / letters.length,
        end: t + ((i + 1) * d) / letters.length,
      }),
    );
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return {
    id: l.id,
    durationSec: dur,
    speechStart: 0.15,
    speechEnd: end,
    words,
    chars,
    env,
  };
};

export const estimateBg31Manifest = (): Bg31Manifest => ({
  version: 1,
  kind: "bg031",
  estimated: true,
  lines: BG31_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type Bg31Cue = {
  readonly id: string;
  readonly role: Bg31Line["role"];
  readonly scene: Bg31SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла (с, от начала ролика)
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly Bg31Word[];
  readonly chars: readonly Bg31Char[];
  readonly env: readonly number[];
};

export type Bg31Scene = {
  readonly id: Bg31SceneId;
  readonly title: string;
  readonly from: number; // кадр ролика
  readonly frames: number;
};

export type Bg31Timeline = {
  readonly scenes: readonly Bg31Scene[];
  readonly cues: readonly Bg31Cue[];
  readonly frames: number;
  readonly speechEnd: number; // конец последней реплики, с
};

export const buildBg31Timeline = (m: Bg31Manifest): Bg31Timeline => {
  const scenes: Bg31Scene[] = [];
  const cues: Bg31Cue[] = [];
  let start = 0; // начало сцены, кадры
  let prevEnd = -Infinity; // конец предыдущей реплики, с
  for (const sc of BG31_SCENES) {
    const s0 = start / FPS;
    let lastEnd = s0;
    for (const l of BG31_LINES.filter((x) => x.scene === sc.id)) {
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
        words: (ml.words ?? est.words ?? []).map((w) => ({
          text: w.text,
          start: w.start + shift,
          end: w.end + shift,
        })),
        chars: (est.chars ?? []).map((c) => ({
          c: c.c,
          start: c.start + shift + lag,
          end: c.end + shift + lag,
        })),
        env: est.env ?? [],
      });
      prevEnd = to;
      lastEnd = to;
    }
    let frames = Math.round(Math.max(sc.len, lastEnd - s0 + sc.tail) * FPS);
    // финал: общая длительность не короче minSec
    if (sc.id === "cta") frames = Math.max(frames, Math.round(BG31_VIDEO.minSec * FPS) - start);
    scenes.push({ id: sc.id, title: sc.title, from: start, frames });
    start += frames;
  }
  return { scenes, cues, frames: start, speechEnd: prevEnd };
};

// Проверка шкалы: файл не начинается раньше 0 с, речь не выходит за свою
// сцену, ролик не длиннее maxSec, после последнего слова ≥ 3 с, хук-вопрос
// звучит в первые 3 с.
export const checkBg31Timeline = (tl: Bg31Timeline): string[] => {
  const problems: string[] = [];
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.to * FPS > sc.from + sc.frames - 6) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  }
  const hook = tl.cues.find((c) => c.scene === "hook");
  if (hook && hook.to > 3.2) problems.push(`хук-вопрос заканчивается на ${hook.to.toFixed(2)} с (нужно ≤ 3 с)`);
  const total = tl.frames / FPS;
  if (total > BG31_VIDEO.maxSec) problems.push(`ролик ${total.toFixed(1)} с длиннее ${BG31_VIDEO.maxSec} с`);
  if (total - tl.speechEnd < 3) problems.push(`после последнего слова только ${(total - tl.speechEnd).toFixed(2)} с`);
  return problems;
};

export const sceneOf = (tl: Bg31Timeline, id: Bg31SceneId) => tl.scenes.find((s) => s.id === id)!;
