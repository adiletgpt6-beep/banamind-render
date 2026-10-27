// Шкала BalaGoBG005: сцены и реплики строятся по фактической озвучке
// (manifest.json). Каждая реплика начинается через lead секунд после начала
// своей сцены; сцена длится не меньше minSec и не меньше «речь + хвост».
// Без озвучки — оценка по тексту (черновой предпросмотр).
// Без зависимостей от Remotion (читается и Node-скриптами).
import {
  BG05_LINES,
  BG05_SCENES,
  BG05_VIDEO,
  type Bg05Line,
  type Bg05Role,
  type Bg05SceneId,
} from "./script.ts";

export type Bg05Word = {
  readonly text: string;
  readonly start: number;
  readonly end: number;
};

export type Bg05ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg05Word[];
  // огибающая громкости файла по кадрам (0…1) — для губ мамы
  readonly env?: readonly number[];
};

export type Bg05Manifest = {
  readonly version: 1;
  readonly kind: "bg005";
  readonly estimated?: boolean;
  readonly lines: readonly Bg05ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}|\p{N}/u.test(ch);

// Оценка: ≈ 14 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg05Line): Bg05ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg05Word[] = [];
  for (const w of tokens) {
    const letters = [...w].filter(isLetter);
    if (!letters.length) continue;
    const d = Math.max(0.2, letters.length / 14);
    words.push({ text: w, start: t, end: t + d });
    t += d + (/[.,!?…—:]$/.test(w) ? 0.3 : 0.07);
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

export const estimateBg05Manifest = (): Bg05Manifest => ({
  version: 1,
  kind: "bg005",
  estimated: true,
  lines: BG05_LINES.map(estimateLine),
});

// Реплика на шкале ролика (абсолютное время, с).
export type Bg05Cue = {
  readonly id: string;
  readonly scene: Bg05SceneId;
  readonly role: Bg05Role;
  readonly text: string;
  readonly file?: string;
  readonly env?: readonly number[];
  readonly audioFrom: number; // начало файла
  readonly durationSec: number;
  readonly from: number; // начало речи
  readonly to: number; // конец речи
  // слова субтитров (текст сценария) с временем по фактической речи
  readonly words: readonly Bg05Word[];
};

export type Bg05Scene = {
  readonly id: Bg05SceneId;
  readonly from: number;
  readonly to: number;
};

export type Bg05Timeline = {
  readonly scenes: readonly Bg05Scene[];
  readonly cues: readonly Bg05Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly ctaFrom: number;
};

const r3 = (x: number) => Math.round(x * 1000) / 1000;

// Слова субтитров берутся из текста сценария (BalaGo, цифры номера);
// время — пропорционально по фактическим словам озвучки.
const subtitleWords = (
  l: Bg05Line,
  ml: Bg05ManifestLine,
  shift: number,
): Bg05Word[] => {
  const shown = l.text.split(/\s+/).filter((w) => [...w].some(isLetter));
  const spoken = ml.words?.length ? ml.words : estimateLine(l).words!;
  const a = spoken[0].start;
  const b = spoken[spoken.length - 1].end;
  if (shown.length === spoken.length)
    return shown.map((text, i) => ({
      text,
      start: spoken[i].start + shift,
      end: spoken[i].end + shift,
    }));
  const per = (b - a) / shown.length;
  return shown.map((text, i) => ({
    text,
    start: a + i * per + shift,
    end: a + (i + 1) * per + shift,
  }));
};

export const buildBg05Timeline = (m: Bg05Manifest): Bg05Timeline => {
  const scenes: Bg05Scene[] = [];
  const cues: Bg05Cue[] = [];
  let t = 0;
  for (const s of BG05_SCENES) {
    const from = t;
    let speechEnd = from;
    for (const l of BG05_LINES.filter((x) => x.scene === s.id)) {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const start = (l.afterPrev ? speechEnd : from) + l.lead;
      const dur = ml.speechEnd - ml.speechStart;
      const shift = start - ml.speechStart;
      cues.push({
        id: l.id,
        scene: s.id,
        role: l.role,
        text: l.text,
        file: ml.file,
        env: ml.env,
        audioFrom: r3(shift),
        durationSec: ml.durationSec,
        from: r3(start),
        to: r3(start + dur),
        words: subtitleWords(l, ml, shift),
      });
      speechEnd = start + dur;
    }
    // длительность сцены — целое число кадров
    const len = Math.max(s.minSec, speechEnd - from + s.tailSec);
    t = Math.ceil((from + len) * BG05_VIDEO.fps) / BG05_VIDEO.fps;
    scenes.push({ id: s.id, from: r3(from), to: r3(t) });
  }
  const frames = Math.round(t * BG05_VIDEO.fps);
  return {
    scenes,
    cues,
    durationSec: frames / BG05_VIDEO.fps,
    frames,
    ctaFrom: scenes.find((s) => s.id === "cta")!.from,
  };
};

export const sceneOf = (tl: Bg05Timeline, id: Bg05SceneId) =>
  tl.scenes.find((s) => s.id === id)!;
export const cueOf = (tl: Bg05Timeline, id: string) =>
  tl.cues.find((c) => c.id === id)!;

// Время (абс., с) начала слова реплики, начинающегося с prefix (без учёта
// регистра); если не найдено — доля fallback от длины реплики.
export const wordTime = (
  c: Bg05Cue,
  prefix: string,
  fallback: number,
  nth = 0,
) => {
  const p = prefix.toLowerCase();
  const hits = c.words.filter((w) =>
    w.text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, "")
      .startsWith(p),
  );
  return hits[nth]?.start ?? c.from + (c.to - c.from) * fallback;
};

// Проверка шкалы: финал держится ≥ 3 с после последнего слова, контакты
// видны ≥ 5 с, реплики не накладываются, ролик 55–76 с (сценарий: 60–72 с, лучше длиннее, чем ускорять речь).
export const checkBg05Timeline = (tl: Bg05Timeline): string[] => {
  const problems: string[] = [];
  const last = tl.cues[tl.cues.length - 1];
  if (tl.durationSec - last.to < 3)
    problems.push(
      `после последнего слова ${(tl.durationSec - last.to).toFixed(2)} с (нужно ≥ 3 с)`,
    );
  if (tl.durationSec - tl.ctaFrom < 8)
    problems.push(
      `финальный экран ${(tl.durationSec - tl.ctaFrom).toFixed(2)} с (нужно ≥ 8 с)`,
    );
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to + 0.3 > next.from)
      problems.push(
        `${c.id}: речь до ${c.to.toFixed(2)} с наезжает на ${next.id}`,
      );
    const s = sceneOf(tl, c.scene);
    if (c.to > s.to - 0.3)
      problems.push(`${c.id}: речь выходит за сцену ${s.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  if (tl.durationSec < 55 || tl.durationSec > 76)
    problems.push(`длительность ${tl.durationSec.toFixed(2)} с вне 55–76 с`);
  return problems;
};
