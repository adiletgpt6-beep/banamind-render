// Шкала BalaGoBG048 строится по фактической озвучке: сцена = действие lead →
// реплики сцены (длительность речи из файла + паузы gapAfter) → пауза tail,
// но не короче min. Речь не ускоряется и не обрезается: монтаж
// подстраивается под голос. Для губ — тайминги букв (ElevenLabs
// with-timestamps) и огибающая громкости файла по кадрам.
// Без озвучки — оценка по тексту (черновой предпросмотр; финальный рендер
// без голоса запрещён, см. manifestGuard.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  B48_AFTER_LAST_WORD_MIN,
  B48_CTA_IN,
  B48_CTA_MIN,
  B48_LINES,
  B48_SCENES,
  B48_VIDEO,
  type B48Line,
  type B48SceneId,
} from "./script.ts";

export type B48Word = { readonly text: string; readonly start: number; readonly end: number };
export type B48Char = { readonly c: string; readonly start: number; readonly end: number };

export type B48ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly B48Word[];
  readonly chars?: readonly B48Char[];
  // громкость файла по кадрам (30 к/с) от начала файла, 0…1
  readonly env?: readonly number[];
};

export type B48Manifest = {
  readonly version: 1;
  readonly kind: "bg048";
  readonly estimated?: boolean;
  readonly lines: readonly B48ManifestLine[];
};

const FPS = B48_VIDEO.fps;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 12 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: B48Line): B48ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: B48Word[] = [];
  const chars: B48Char[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 12);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: t + (i * d) / letters.length, end: t + ((i + 1) * d) / letters.length }));
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * FPS) }, (_, i) => {
    const s = (i + 0.5) / FPS;
    const w = words.find((x) => s >= x.start && s <= x.end);
    return w ? Number((0.55 + 0.35 * Math.abs(Math.sin(s * 17))).toFixed(2)) : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateB48Manifest = (): B48Manifest => ({
  version: 1,
  kind: "bg048",
  estimated: true,
  lines: B48_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле в среднем на ≈ 65 мс.
export const CHAR_LAG = 0.065;

export type B48Cue = {
  readonly id: string;
  readonly role: B48Line["role"];
  readonly scene: B48SceneId;
  readonly text: string;
  readonly subtitle: boolean;
  readonly file?: string;
  readonly audioFrom: number; // начало файла, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly B48Word[];
  readonly chars: readonly B48Char[];
  readonly env: readonly number[]; // по кадрам от audioFrom
};

export type B48SceneSpan = { readonly id: B48SceneId; readonly title: string; readonly from: number; readonly to: number };

export type B48Timeline = {
  readonly scenes: readonly B48SceneSpan[];
  readonly cues: readonly B48Cue[];
  readonly ctaFrom: number; // финальный экран с контактами, с
  readonly lastWord: number; // конец последнего слова, с
  readonly durationSec: number;
  readonly frames: number;
};

const snap = (t: number) => Math.round(t * FPS) / FPS;

export const buildB48Timeline = (m: B48Manifest): B48Timeline => {
  const scenes: B48SceneSpan[] = [];
  const cues: B48Cue[] = [];
  let t = 0;
  for (const sc of B48_SCENES) {
    const start = snap(t);
    let cur = start + sc.lead;
    const lines = B48_LINES.filter((l) => l.scene === sc.id);
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const real = Boolean(ml.chars && ml.env);
      const est = real ? ml : { ...estimateLine(l), ...ml };
      const from = snap(cur);
      const shift = from - ml.speechStart;
      const to = from + (ml.speechEnd - ml.speechStart);
      cues.push({
        id: l.id,
        role: l.role,
        scene: sc.id,
        text: l.text,
        subtitle: l.subtitle !== false,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from,
        to,
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c) => ({
          c: c.c,
          start: c.start + shift + (ml.file ? CHAR_LAG : 0),
          end: c.end + shift + (ml.file ? CHAR_LAG : 0),
        })),
        env: est.env ?? [],
      });
      cur = to + (i < lines.length - 1 ? (l.gapAfter ?? 0.45) : 0);
    });
    const end = snap(Math.max(start + sc.min, cur + sc.tail));
    scenes.push({ id: sc.id, title: sc.title, from: start, to: end });
    t = end;
  }
  const cta = scenes[scenes.length - 1];
  const lastWord = cues[cues.length - 1].to;
  const ctaFrom = snap(cta.from + B48_CTA_IN);
  // финальный экран ≥ 5 с и ≥ 3 с после последнего слова (с запасом)
  let durationSec = cta.to;
  durationSec = Math.max(durationSec, ctaFrom + B48_CTA_MIN + 1, lastWord + B48_AFTER_LAST_WORD_MIN + 0.6);
  durationSec = Math.ceil(durationSec * FPS) / FPS;
  scenes[scenes.length - 1] = { ...cta, to: durationSec };
  return { scenes, cues, ctaFrom, lastWord, durationSec, frames: Math.round(durationSec * FPS) };
};

// Проверка шкалы: реплики не накладываются, файл не начинается раньше 0 с,
// речь не выходит за свою сцену, финал по правилам, ролик не длиннее maxSec.
// Возвращает список проблем (пустой — всё в порядке).
export const checkB48Timeline = (tl: B48Timeline): string[] => {
  const problems: string[] = [];
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to > next.from - 0.2) problems.push(`${c.id}: речь заходит на ${next.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.to > sc.to - 0.3) problems.push(`${c.id}: речь выходит за сцену ${sc.id}`);
  });
  const n05 = tl.cues.find((c) => c.id === "n05");
  if (n05 && n05.from < tl.ctaFrom) problems.push("n05 звучит раньше, чем показан финальный экран");
  if (tl.durationSec - tl.ctaFrom < B48_CTA_MIN) problems.push("контакты на экране < 5 с");
  if (tl.durationSec - tl.lastWord < B48_AFTER_LAST_WORD_MIN) problems.push("после последнего слова < 3 с");
  if (tl.durationSec > B48_VIDEO.maxSec) problems.push(`ролик ${tl.durationSec.toFixed(1)} с длиннее ${B48_VIDEO.maxSec} с`);
  return problems;
};

export const sceneSpan = (tl: B48Timeline, id: B48SceneId) => tl.scenes.find((s) => s.id === id)!;
