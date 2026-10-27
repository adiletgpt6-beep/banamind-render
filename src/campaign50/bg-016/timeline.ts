// Шкала BalaGoBG016: сцены подряд, длительность сцены подстраивается под
// фактическую длину реплик (речь не ускоряется и не обрезается).
// Без озвучки — оценка по тексту. Без зависимостей от Remotion.
import { BG016_CTA, BG016_LINES, BG016_SCENES, BG016_VIDEO, type Bg016Line, type Bg016Role, type Bg016SceneId } from "./script.ts";

export type Word = { readonly text: string; readonly start: number; readonly end: number };
export type Char = { readonly c: string; readonly start: number; readonly end: number };

export type ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Word[];
  readonly chars?: readonly Char[];
  readonly env?: readonly number[];
};

export type Manifest = { readonly lines: readonly ManifestLine[]; readonly estimated?: boolean };

export type Cue = {
  readonly id: string;
  readonly role: Bg016Role;
  readonly scene: Bg016SceneId;
  readonly file: string | null;
  readonly audioFrom: number; // с, начало файла на шкале ролика
  readonly from: number; // с, начало речи
  readonly to: number; // с, конец речи
  readonly words: readonly Word[]; // абсолютное время
  readonly chars: readonly Char[]; // абсолютное время
  readonly env: readonly number[];
  readonly line: Bg016Line;
};

export type SceneSpan = { readonly id: Bg016SceneId; readonly from: number; readonly to: number };

export type Timeline = {
  readonly scenes: readonly SceneSpan[];
  readonly cues: readonly Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly estimated: boolean;
};

const spokenOf = (l: Bg016Line) => l.spoken ?? l.text;
export const spokenWords = (l: Bg016Line) => spokenOf(l).split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w));

// Оценка без озвучки: ≈ 14 букв в секунду, слова — пропорционально длине.
export const estimateManifest = (): Manifest => ({
  estimated: true,
  lines: BG016_LINES.map((l) => {
    const ws = spokenWords(l);
    const letters = ws.reduce((a, w) => a + w.length, 0);
    const speech = letters / 14 + ws.length * 0.06;
    let t = 0.05;
    const chars: Char[] = [];
    const words = ws.map((w) => {
      const d = ((w.length / letters) * (speech - ws.length * 0.06)) + 0.06;
      const r = { text: w, start: Number(t.toFixed(3)), end: Number((t + d - 0.04).toFixed(3)) };
      const ls = [...w].filter((c) => /\p{L}/u.test(c));
      ls.forEach((c, i) => chars.push({ c: c.toLowerCase(), start: r.start + ((r.end - r.start) * i) / ls.length, end: r.start + ((r.end - r.start) * (i + 1)) / ls.length }));
      t += d;
      return r;
    });
    const dur = speech + 0.25;
    const env = Array.from({ length: Math.ceil(dur * BG016_VIDEO.fps) }, (_, i) => {
      const s = (i + 0.5) / BG016_VIDEO.fps;
      return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
    });
    return { id: l.id, durationSec: dur, speechStart: 0.05, speechEnd: speech + 0.05, words, chars, env };
  }),
});

export const buildTimeline = (manifest: Manifest): Timeline => {
  const byId = new Map(manifest.lines.map((l) => [l.id, l]));
  const scenes: SceneSpan[] = [];
  const cues: Cue[] = [];
  let t0 = 0;
  for (const s of BG016_SCENES) {
    let cursor = t0;
    let lastEnd = t0;
    let first = true;
    for (const line of BG016_LINES.filter((l) => l.scene === s.id)) {
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
        audioFrom,
        from,
        to,
        words: (m.words ?? []).map((w) => ({ text: w.text, start: audioFrom + w.start, end: audioFrom + w.end })),
        chars: (m.chars ?? []).map((c) => ({ c: c.c, start: audioFrom + c.start, end: audioFrom + c.end })),
        env: m.env ?? [],
        line,
      });
      cursor = to;
      lastEnd = Math.max(lastEnd, audioFrom + m.durationSec - 0.1, to);
    }
    const end = Math.max(t0 + s.min, lastEnd + s.tail);
    const fps = BG016_VIDEO.fps;
    const to = Math.round(end * fps) / fps;
    scenes.push({ id: s.id, from: t0, to });
    t0 = to;
  }
  const frames = Math.round(t0 * BG016_VIDEO.fps);
  return { scenes, cues, durationSec: frames / BG016_VIDEO.fps, frames, estimated: Boolean(manifest.estimated) };
};

// Финальный экран: когда все контакты на экране и когда закончилась речь.
export const CTA_REVEAL = 0.7; // с от начала сцены cta до полной видимости контактов
export const ctaCheck = (tl: Timeline) => {
  const cta = tl.scenes.find((s) => s.id === "cta")!;
  const lastWord = Math.max(...tl.cues.map((c) => c.to));
  const visibleFrom = cta.from + CTA_REVEAL;
  const visibleSec = tl.durationSec - visibleFrom;
  const afterVoice = tl.durationSec - lastWord;
  const problems: string[] = [];
  if (visibleSec < BG016_CTA.minVisibleSec) problems.push(`контакты видны ${visibleSec.toFixed(2)} с < ${BG016_CTA.minVisibleSec}`);
  if (afterVoice < BG016_CTA.minAfterVoiceSec) problems.push(`после голоса ${afterVoice.toFixed(2)} с < ${BG016_CTA.minAfterVoiceSec}`);
  return { visibleFrom, visibleSec, afterVoice, lastWord, problems };
};

// Время начала слова (абсолютное, с) по номеру слова произношения.
export const wordTime = (cue: Cue, w: number) => {
  if (cue.words.length) return cue.words[Math.min(w, cue.words.length - 1)].start;
  const n = Math.max(1, spokenWords(cue.line).length);
  return cue.from + ((cue.to - cue.from) * Math.min(w, n)) / n;
};
