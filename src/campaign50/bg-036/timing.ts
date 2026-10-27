// Шкала BalaGoBG036. Сцены идут подряд; реплика начинается в момент at
// (от начала своей сцены), но не раньше чем через gap после конца
// предыдущей. Длительность реплики — из файла озвучки (manifest.json);
// если речь длиннее, сцена растягивается (tail после последней реплики).
// Так реплика никогда не обрезается и не ускоряется.
// Без озвучки — оценка по тексту (для превью; финальный рендер без голоса
// запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  BG36_LINES,
  BG36_SCENES,
  BG36_VIDEO,
  type Bg36Line,
  type Bg36SceneId,
} from "./script.ts";

export type Bg36Word = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
};

export type Bg36ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg36Word[];
};

export type Bg36Manifest = {
  readonly version: 1;
  readonly kind: "bg036";
  readonly estimated?: boolean;
  readonly lines: readonly Bg36ManifestLine[];
};

const FPS = BG36_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13,5 буквы в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg36Line): Bg36ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg36Word[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 13.5);
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.!?…]$/.test(w) ? 0.38 : /[,—]$/.test(w) ? 0.22 : 0.06);
  }
  const end = words.length ? words[words.length - 1].end : t;
  return {
    id: l.id,
    durationSec: end + 0.2,
    speechStart: 0.15,
    speechEnd: end,
    words,
  };
};

export const estimateBg36Manifest = (): Bg36Manifest => ({
  version: 1,
  kind: "bg036",
  estimated: true,
  lines: BG36_LINES.map(estimateLine),
});

export type Bg36Cue = {
  readonly id: string;
  readonly role: Bg36Line["role"];
  readonly scene: Bg36SceneId;
  readonly file?: string;
  readonly audioFrom: number; // начало файла (с, от начала ролика)
  readonly durationSec: number;
  readonly from: number; // начало речи (с)
  readonly to: number; // конец речи (с)
  // Слова реплики (как в тексте субтитров) со временем от начала ролика.
  readonly words: readonly Bg36Word[];
};

export type Bg36Scene = {
  readonly id: Bg36SceneId;
  readonly title: string;
  readonly from: number; // кадр ролика
  readonly frames: number;
};

export type Bg36Timeline = {
  readonly scenes: readonly Bg36Scene[];
  readonly cues: readonly Bg36Cue[];
  readonly frames: number;
  readonly speechEnd: number; // конец последней реплики, с
};

// Слова субтитров (text) сопоставляются со словами озвучки (spoken) по
// порядку; если их число различается — равномерно по реплике.
const textWords = (
  l: Bg36Line,
  spokenWords: readonly Bg36Word[],
  from: number,
  to: number,
): Bg36Word[] => {
  const tw = l.text.split(/\s+/).filter((w) => [...w].some(isLetter) || /\d/.test(w));
  if (spokenWords.length === tw.length)
    return tw.map((text, i) => ({ text, start: spokenWords[i].start, end: spokenWords[i].end }));
  const step = (to - from) / Math.max(1, tw.length);
  return tw.map((text, i) => ({ text, start: from + i * step, end: from + (i + 1) * step }));
};

export const buildBg36Timeline = (m: Bg36Manifest): Bg36Timeline => {
  const scenes: Bg36Scene[] = [];
  const cues: Bg36Cue[] = [];
  let start = 0; // начало сцены, кадры
  let prevEnd = -Infinity; // конец предыдущей реплики, с
  for (const sc of BG36_SCENES) {
    const s0 = start / FPS;
    let lastEnd = s0;
    for (const l of BG36_LINES.filter((x) => x.scene === sc.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const from = Math.max(s0 + l.at, prevEnd + (l.gap ?? 0.3));
      const to = from + (ml.speechEnd - ml.speechStart);
      const shift = from - ml.speechStart;
      const spoken = (ml.words ?? estimateLine(l).words ?? []).map((w) => ({
        text: w.text,
        start: w.start + shift,
        end: w.end + shift,
      }));
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        words: textWords(l, spoken, from, to),
      });
      prevEnd = to;
      lastEnd = to;
    }
    let frames = Math.round(Math.max(sc.len, lastEnd - s0 + sc.tail) * FPS);
    // финал: общая длительность не короче minSec
    if (sc.id === "cta")
      frames = Math.max(frames, Math.round(BG36_VIDEO.minSec * FPS) - start);
    scenes.push({ id: sc.id, title: sc.title, from: start, frames });
    start += frames;
  }
  return { scenes, cues, frames: start, speechEnd: prevEnd };
};

// Проверка шкалы: файл не начинается раньше 0 с, речь не выходит за свою
// сцену, ролик не длиннее maxSec, после последнего слова ≥ 3 с.
export const checkBg36Timeline = (tl: Bg36Timeline): string[] => {
  const problems: string[] = [];
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    if (c.to * FPS > sc.from + sc.frames - 6)
      problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  }
  const total = tl.frames / FPS;
  if (total > BG36_VIDEO.maxSec)
    problems.push(`ролик ${total.toFixed(1)} с длиннее ${BG36_VIDEO.maxSec} с`);
  if (total - tl.speechEnd < 3)
    problems.push(`после последнего слова только ${(total - tl.speechEnd).toFixed(2)} с`);
  return problems;
};

export const sceneOf = (tl: Bg36Timeline, id: Bg36SceneId) =>
  tl.scenes.find((s) => s.id === id)!;
