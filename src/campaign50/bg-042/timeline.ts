// Шкала BalaGoBG042: сцены подряд, длительность сцены подстраивается под
// фактическую длину реплик (речь не ускоряется и не обрезается).
// Без озвучки — оценка по тексту (только для локальных черновых кадров).
// Без зависимостей от Remotion: читается и Node-скриптами.
import { BG42_CTA, BG42_LINES, BG42_SCENES, BG42_VIDEO, spokenWords, type Bg42Line, type Bg42Role, type Bg42SceneId } from "./script.ts";

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export type Char = { readonly c: string; readonly start: number; readonly end: number };

export type ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly hash?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Word[];
  readonly chars?: readonly Char[];
  // Громкость файла по кадрам (30 к/с) от начала файла, 0…1 — для губ.
  readonly env?: readonly number[];
};

export type Manifest = { readonly lines: readonly ManifestLine[]; readonly estimated?: boolean };

export type Cue = {
  readonly id: string;
  readonly role: Bg42Role;
  readonly scene: Bg42SceneId;
  readonly file: string | null;
  readonly audioFrom: number; // с, начало файла на шкале ролика
  readonly from: number; // с, начало речи
  readonly to: number; // с, конец речи
  readonly words: readonly Word[]; // абсолютное время
  readonly chars: readonly Char[]; // абсолютное время
  readonly env: readonly number[];
  readonly line: Bg42Line;
};

export type SceneSpan = { readonly id: Bg42SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Timeline = {
  readonly scenes: readonly SceneSpan[];
  readonly cues: readonly Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly estimated: boolean;
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);
const r3 = (x: number) => Math.round(x * 1000) / 1000;

// Оценка без озвучки: ≈ 13,5 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg42Line): ManifestLine => {
  let t = 0.15;
  const words: Word[] = [];
  const chars: Char[] = [];
  for (const w of spokenWords(l)) {
    const letters = [...w].filter(isLetter);
    const d = Math.max(0.2, letters.length / 13.5);
    letters.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: r3(t + (i * d) / letters.length), end: r3(t + ((i + 1) * d) / letters.length) }));
    words.push({ text: w, start: r3(t), end: r3(t + d) });
    t += d + (/[.,!?…;—]$/.test(w) ? 0.3 : 0.07);
  }
  const end = words.length ? words[words.length - 1].end : t;
  const dur = end + 0.2;
  const env = Array.from({ length: Math.ceil(dur * BG42_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / BG42_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: r3(dur), speechStart: 0.15, speechEnd: r3(end), words, chars, env };
};

export const estimateManifest = (): Manifest => ({ estimated: true, lines: BG42_LINES.map(estimateLine) });

export const buildTimeline = (manifest: Manifest): Timeline => {
  const byId = new Map(manifest.lines.map((l) => [l.id, l]));
  const fps = BG42_VIDEO.fps;
  const scenes: SceneSpan[] = [];
  const cues: Cue[] = [];
  let t0 = 0;
  for (const s of BG42_SCENES) {
    let cursor = t0;
    let lastEnd = t0;
    let first = true;
    for (const line of BG42_LINES.filter((l) => l.scene === s.id)) {
      const m = byId.get(line.id);
      if (!m) throw new Error(`Нет озвучки/оценки для ${line.id}`);
      const from = first ? t0 + (line.lead ?? 0.5) : cursor + (line.gap ?? 0.4);
      first = false;
      const audioFrom = from - m.speechStart;
      const to = audioFrom + m.speechEnd;
      cues.push({
        id: line.id,
        role: line.role,
        scene: s.id,
        file: m.file ?? null,
        audioFrom: r3(audioFrom),
        from: r3(from),
        to: r3(to),
        words: (m.words ?? []).map((w) => ({ text: w.text, start: r3(audioFrom + w.start), end: r3(audioFrom + w.end) })),
        chars: (m.chars ?? []).map((c) => ({ c: c.c, start: r3(audioFrom + c.start), end: r3(audioFrom + c.end) })),
        env: m.env ?? [],
        line,
      });
      cursor = to;
      lastEnd = Math.max(lastEnd, to);
    }
    const end = Math.max(t0 + s.min, lastEnd + s.tail);
    // границы сцен — по целым кадрам
    const to = Math.ceil(end * fps) / fps;
    scenes.push({ id: s.id, title: s.title, from: r3(t0), to: r3(to) });
    t0 = to;
  }
  const frames = Math.round(t0 * fps);
  return { scenes, cues, durationSec: frames / fps, frames, estimated: Boolean(manifest.estimated) };
};

// Финальный экран: контакты полностью видны через CTA_REVEAL с после начала
// сцены cta и стоят неподвижно до последнего кадра.
export const CTA_REVEAL = 0.7;
export const ctaCheck = (tl: Timeline) => {
  const cta = tl.scenes.find((s) => s.id === "cta")!;
  const lastWord = Math.max(...tl.cues.map((c) => c.to));
  const visibleFrom = cta.from + CTA_REVEAL;
  const visibleSec = tl.durationSec - visibleFrom;
  const afterVoice = tl.durationSec - lastWord;
  const problems: string[] = [];
  if (visibleSec < BG42_CTA.minVisibleSec) problems.push(`контакты видны ${visibleSec.toFixed(2)} с < ${BG42_CTA.minVisibleSec}`);
  if (afterVoice < BG42_CTA.minAfterVoiceSec) problems.push(`после голоса ${afterVoice.toFixed(2)} с < ${BG42_CTA.minAfterVoiceSec}`);
  return { visibleFrom, visibleSec, afterVoice, lastWord, problems };
};

export const cueOf = (tl: Timeline, id: string): Cue => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return c;
};

export const sceneOf = (tl: Timeline, id: Bg42SceneId): SceneSpan => tl.scenes.find((s) => s.id === id)!;

/** Начало слова (абсолютное, с) по номеру слова произношения. */
export const wordTime = (cue: Cue, w: number) => {
  const n = Math.max(1, spokenWords(cue.line).length);
  if (cue.words.length === n) return cue.words[Math.min(w, n - 1)].start;
  return cue.from + ((cue.to - cue.from) * Math.min(w, n)) / n;
};
/** Конец слова (абсолютное, с). */
export const wordEnd = (cue: Cue, w: number) => {
  const n = Math.max(1, spokenWords(cue.line).length);
  if (cue.words.length === n) return cue.words[Math.min(w, n - 1)].end;
  return cue.from + ((cue.to - cue.from) * Math.min(w + 1, n)) / n;
};

// ---------- Титры ----------
export type Sub = { readonly id: string; readonly role: Bg42Role; readonly scene: Bg42SceneId; readonly text: string; readonly from: number; readonly to: number };

export const buildSubs = (tl: Timeline): Sub[] => {
  const out: Sub[] = [];
  for (const c of tl.cues) {
    c.line.chunks.forEach((ch, i) => {
      const from = i === 0 ? c.from - 0.08 : wordTime(c, ch.w) - 0.05;
      const next = c.line.chunks[i + 1];
      const to = next ? wordTime(c, next.w) - 0.05 : c.to + 0.35;
      out.push({ id: `${c.id}-${i}`, role: c.role, scene: c.scene, text: ch.text, from: r3(from), to: r3(to) });
    });
  }
  // в коротких паузах между репликами фраза держится до следующей
  for (let i = 0; i < out.length - 1; i++) {
    const gap = out[i + 1].from - out[i].to;
    if (gap > 0 && gap < 0.35) out[i] = { ...out[i], to: out[i + 1].from };
  }
  return out;
};
