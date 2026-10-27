// Шкала ролика BalaGo «Сабак бүттү» по озвучке. Сначала естественная озвучка, затем
// монтаж под неё: длительность сцены = пауза + речь + пауза, но не меньше
// минимума сцены; оставшееся до 60 с время раздаётся сценам в пределах их
// бюджета по сценарию (без ускорения речи). Без озвучки — оценка по тексту
// (≈ 10,6 буквы в секунду вместе с паузами, как у голоса KG-teacher).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  TC_END_PAD,
  TC_LINES,
  TC_SCENES,
  TC_TAIL,
  TC_VIDEO,
  type TcLine,
  type TcSceneId,
} from "./script.ts";

export type TcWord = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
};

// Формат строки manifest.json совпадает с озвучкой ролика №12
// (scripts/lib/ts2d-tts.mjs → synthLine).
export type TcManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly TcWord[];
};

export type TcManifest = {
  readonly version: 1;
  readonly kind: "taxi-child";
  readonly estimated?: boolean;
  readonly lines: readonly TcManifestLine[];
};

const LETTERS_PER_SEC = 12;
const isLetter = (ch: string) => /\p{L}/u.test(ch);

export const estimateLine = (l: TcLine): TcManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.12;
  const words: TcWord[] = [];
  for (const w of tokens) {
    const n = [...w].filter(isLetter).length;
    if (!n) continue;
    const d = Math.max(0.18, n / LETTERS_PER_SEC);
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.!?…]$/.test(w) ? 0.35 : /[,—]$/.test(w) ? 0.15 : 0.04);
  }
  const end = words.length ? words[words.length - 1].end : t;
  return {
    id: l.id,
    durationSec: end + 0.15,
    speechStart: 0.12,
    speechEnd: end,
    words,
  };
};

export const estimateTcManifest = (): TcManifest => ({
  version: 1,
  kind: "taxi-child",
  estimated: true,
  lines: TC_LINES.map(estimateLine),
});

// Реплика сцены на шкале ролика (абсолютное время, с).
export type TcCue = {
  readonly id: string;
  readonly file?: string;
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  readonly words: readonly TcWord[];
};

export type TcSceneSlot = {
  readonly id: TcSceneId;
  readonly title: string;
  readonly from: number; // кадр ролика
  readonly to: number;
  readonly cue: TcCue;
};

export type TcTimeline = {
  readonly scenes: readonly TcSceneSlot[];
  readonly cues: readonly TcCue[];
  readonly problems: readonly string[];
};

const speechOf = (ml: Pick<TcManifestLine, "speechStart" | "speechEnd">) =>
  ml.speechEnd - ml.speechStart;

// Длительности сцен (с) по длительностям речи.
export const sceneDurations = (
  speech: readonly number[],
): { durations: number[]; problems: string[] } => {
  const total = TC_VIDEO.durationSec;
  const last = TC_SCENES.length - 1;
  const need = TC_SCENES.map((s, i) =>
    Math.max(s.min, s.lead + speech[i] + (i === last ? TC_END_PAD : TC_TAIL)),
  );
  const budget = TC_SCENES.map((s) => s.budget[1] - s.budget[0]);
  const free = total - need.reduce((a, b) => a + b, 0);
  const problems: string[] = [];
  if (free < 0) {
    problems.push(
      `речь не помещается в ${total} с: не хватает ${(-free).toFixed(2)} с`,
    );
    const k = total / need.reduce((a, b) => a + b, 0);
    return { durations: need.map((n) => n * k), problems };
  }
  const slack = need.map((n, i) => Math.max(0, budget[i] - n));
  const sum = slack.reduce((a, b) => a + b, 0);
  const durations =
    sum > 0
      ? need.map((n, i) => n + (slack[i] * free) / sum)
      : need.map((n) => n + free / need.length);
  return { durations, problems };
};

export const buildTcTimeline = (m: TcManifest): TcTimeline => {
  const fps = TC_VIDEO.fps;
  const lines = TC_SCENES.map((s) => {
    const l = TC_LINES.find((x) => x.scene === s.id)!;
    return {
      line: l,
      ml: m.lines.find((x) => x.id === l.id) ?? estimateLine(l),
    };
  });
  const { durations, problems } = sceneDurations(
    lines.map(({ ml }) => speechOf(ml)),
  );
  const scenes: TcSceneSlot[] = [];
  let acc = 0;
  TC_SCENES.forEach((s, i) => {
    const from = Math.round(acc * fps);
    acc += durations[i];
    const to =
      i === TC_SCENES.length - 1
        ? TC_VIDEO.durationSec * fps
        : Math.round(acc * fps);
    const { line, ml } = lines[i];
    const at = from / fps + s.lead;
    const shift = at - ml.speechStart;
    scenes.push({
      id: s.id,
      title: s.title,
      from,
      to,
      cue: {
        id: line.id,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: at,
        to: at + speechOf(ml),
        words: (ml.words?.length
          ? ml.words
          : (estimateLine(line).words ?? [])
        ).map((w) => ({
          text: w.text,
          start: w.start + shift,
          end: w.end + shift,
        })),
      },
    });
  });
  scenes.forEach((sc) => {
    if (sc.cue.to > sc.to / fps - 0.15)
      problems.push(
        `${sc.cue.id}: речь до ${sc.cue.to.toFixed(2)} с, сцена до ${(sc.to / fps).toFixed(2)} с`,
      );
    if (sc.cue.audioFrom < 0)
      problems.push(`${sc.cue.id}: файл начинается раньше 0 с`);
  });
  const lastCue = scenes[scenes.length - 1].cue;
  if (lastCue.to > TC_VIDEO.durationSec - TC_END_PAD + 0.01)
    problems.push(
      `${lastCue.id}: речь заканчивается позже ${TC_VIDEO.durationSec - TC_END_PAD} с`,
    );
  return { scenes, cues: scenes.map((s) => s.cue), problems };
};

// Проверка шкалы по строкам манифеста (для Node-скриптов и тестов).
export const checkTcTiming = (
  lines: readonly TcManifestLine[],
): readonly string[] =>
  buildTcTimeline({ version: 1, kind: "taxi-child", lines }).problems;

// Ключевые моменты сцен (кадры сцены): общие для анимации и звука.
// Привязаны к словам диктора, поэтому следуют за озвучкой.
export const sceneBeats = (s: TcSceneSlot): Record<string, number> => {
  const D = s.to - s.from;
  const w = (p: string, fb: number, nth = 0) => wordFrame(s, p, fb, nth);
  const k = (n: number, base: number) => Math.round((n * D) / base);
  switch (s.id) {
    case "hook":
      return { bell: 10, cap: 70, brand: 90, line: D - 14 };
    case "service": {
      const back0 = w("сабактан", 0.5);
      return {
        title: Math.max(4, w("такси", 0) - 2),
        fwd0: w("үйдөн", 0.2),
        fwd1: back0 - 4,
        back0,
        back1: Math.min(D - 8, w("жеткирген", 0.85) + 16),
      };
    }
    case "group": {
      const greet = w("каттамда", 0.55) - 4;
      return {
        inside: w("чогуу", 0.35),
        greet,
        flip: greet + Math.round((D - greet) * 0.55),
      };
    }
    case "whatsapp": {
      const mapAt = w("геолокация", 0.7) + 10;
      return {
        phone: 20,
        m1: w("баланы", 0.15),
        m2: w("жеткиргенин", 0.4),
        loc: w("унаанын", 0.6),
        map: mapAt,
        back: Math.min(D - 42, Math.max(mapAt + 26, w("аласыз", 0.95))),
      };
    }
    case "handoff":
      return {
        stop: k(44, 200),
        door: k(50, 200),
        out: k(56, 200),
        meet: k(112, 200),
        hand: k(120, 200),
        toast: k(126, 200),
        enter: k(158, 200),
      };
    case "price":
      return { price: w("балага", 0.6) - 8, notes: w("балага", 0.6) + 8 };
    case "trial": {
      const kids = w("үч", 0.1);
      return {
        kids,
        card: w("биринчи", 0.45),
        stamp: w("акысыз", 0.7),
        main: w("биринчи", 0.45) + 10,
      };
    }
    case "cta": {
      const lock = D - 125; // последние 4 с — без изменений
      return {
        link: Math.min(lock - 30, w("профилдеги", 0.05) + 4),
        wa: Math.min(lock, w("ватсап", 0.45)),
      };
    }
  }
};

// Момент начала слова реплики (кадр сцены). Слово ищется по началу
// (без знаков препинания, без учёта регистра); если не найдено —
// доля fallback от длительности речи.
const clean = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}-]/gu, "");
export const wordFrame = (
  slot: TcSceneSlot,
  prefix: string,
  fallback = 0.5,
  nth = 0,
): number => {
  const fps = TC_VIDEO.fps;
  const p = clean(prefix);
  const hits = slot.cue.words.filter((w) => clean(w.text).startsWith(p));
  const w = hits[nth];
  const sec = w
    ? w.start
    : slot.cue.from + (slot.cue.to - slot.cue.from) * fallback;
  return Math.round(sec * fps) - slot.from;
};

// ---------- Субтитры ----------
export const SUB_MAX_CHARS = 30;

// Деление текста на фразы ≤ 2 строк: по предложениям, затем по словам.
export const subtitleChunks = (text: string): string[] => {
  const sentences = text
    .match(/[^.!?…]+[.!?…]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text];
  const out: string[] = [];
  for (const s of sentences) {
    if (s.length <= SUB_MAX_CHARS * 2) {
      out.push(s);
      continue;
    }
    let cur = "";
    for (const w of s.split(/\s+/)) {
      const next = cur ? `${cur} ${w}` : w;
      if (next.length > SUB_MAX_CHARS * 2 - 6 && cur) {
        out.push(cur);
        cur = w;
      } else cur = next;
    }
    if (cur) out.push(cur);
  }
  return out;
};
