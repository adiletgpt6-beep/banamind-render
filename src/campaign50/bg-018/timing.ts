// Шкала BalaGoBG018: сцены идут подряд, длительность каждой — по фактическим
// файлам озвучки (лид + реплики с паузами + хвост, не меньше min). Без
// озвучки — оценка по тексту (только для черновых кадров; финальный рендер
// без голоса запрещён, см. loadManifest.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { BG18_LINES, BG18_SCENES, BG18_VIDEO, type Bg18Line, type Bg18Role, type Bg18SceneId } from "./script.ts";

export type Bg18Word = { readonly text: string; readonly start: number; readonly end: number };
export type Bg18Char = { readonly c: string; readonly start: number; readonly end: number };

export type Bg18ManifestLine = {
  readonly id: string;
  readonly file?: string;
  readonly hash?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words?: readonly Bg18Word[];
  readonly chars?: readonly Bg18Char[];
  readonly env?: readonly number[];
};

export type Bg18Manifest = {
  readonly version: 1;
  readonly kind: "bg018";
  readonly estimated?: boolean;
  readonly lines: readonly Bg18ManifestLine[];
};

const isLetter = (ch: string) => /\p{L}/u.test(ch);

// Оценка: ≈ 13 букв в секунду, паузы на знаках препинания.
export const estimateLine = (l: Bg18Line): Bg18ManifestLine => {
  const tokens = (l.spoken ?? l.text).split(/\s+/).filter(Boolean);
  let t = 0.15;
  const words: Bg18Word[] = [];
  const chars: Bg18Char[] = [];
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
  const env = Array.from({ length: Math.ceil(dur * BG18_VIDEO.fps) }, (_, i) => {
    const s = (i + 0.5) / BG18_VIDEO.fps;
    return words.some((w) => s >= w.start && s <= w.end) ? 0.8 : 0;
  });
  return { id: l.id, durationSec: dur, speechStart: 0.15, speechEnd: end, words, chars, env };
};

export const estimateBg18Manifest = (): Bg18Manifest => ({
  version: 1,
  kind: "bg018",
  estimated: true,
  lines: BG18_LINES.map(estimateLine),
});

// Тайминги букв ElevenLabs опережают звук в файле ≈ на 65 мс.
export const CHAR_LAG = 0.065;

// Реплика на шкале ролика (абсолютное время, с). Формат совместим с
// Ts2Cue (губы персонажей считает общий rig two-schedules-2d).
export type Bg18Cue = {
  readonly id: string;
  readonly role: Bg18Role;
  readonly scene: Bg18SceneId;
  readonly text: string;
  readonly file?: string;
  readonly audioFrom: number;
  readonly durationSec: number;
  readonly from: number;
  readonly to: number;
  readonly words: readonly Bg18Word[];
  readonly chars: readonly Bg18Char[];
  readonly env: readonly number[];
};

export type Bg18Scene = { readonly id: Bg18SceneId; readonly title: string; readonly from: number; readonly to: number };

export type Bg18Timeline = {
  readonly scenes: readonly Bg18Scene[];
  readonly cues: readonly Bg18Cue[];
  readonly durationSec: number;
  readonly frames: number;
  readonly lastWordEnd: number;
};

const r3 = (x: number) => Math.round(x * 1000) / 1000;

export const buildBg18Timeline = (m: Bg18Manifest): Bg18Timeline => {
  const fps = BG18_VIDEO.fps;
  const scenes: Bg18Scene[] = [];
  const cues: Bg18Cue[] = [];
  let t = 0;
  for (const sc of BG18_SCENES) {
    const from = t;
    const lines = BG18_LINES.filter((l) => l.scene === sc.id);
    let at = from + sc.lead;
    lines.forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l), ...ml };
      if (i > 0) at += l.gap ?? 0.45;
      const speech = ml.speechEnd - ml.speechStart;
      const shift = at - ml.speechStart;
      const lag = ml.chars && ml.file ? CHAR_LAG : 0;
      cues.push({
        id: l.id,
        role: l.role,
        scene: l.scene,
        text: l.text,
        file: ml.file,
        audioFrom: r3(shift),
        durationSec: ml.durationSec,
        from: r3(at),
        to: r3(at + speech),
        words: (ml.words ?? est.words ?? []).map((w) => ({ text: w.text, start: r3(w.start + shift), end: r3(w.end + shift) })),
        chars: (est.chars ?? []).map((c) => ({ c: c.c, start: r3(c.start + shift + lag), end: r3(c.end + shift + lag) })),
        env: est.env ?? [],
      });
      at += speech;
    });
    // сцена кончается на целом кадре
    const to = Math.ceil(Math.max(from + sc.min, at + sc.tail) * fps) / fps;
    scenes.push({ id: sc.id, title: sc.title, from: r3(from), to: r3(to) });
    t = to;
  }
  const frames = Math.round(t * fps);
  return { scenes, cues, durationSec: frames / fps, frames, lastWordEnd: Math.max(...cues.map((c) => c.to)) };
};

// Проверка шкалы: реплики не накладываются, файлы не обрываются сценой,
// финальный экран держится ≥ 3 с после последнего слова, контакты ≥ 5 с.
export const checkBg18Timeline = (tl: Bg18Timeline): string[] => {
  const out: string[] = [];
  const sorted = [...tl.cues].sort((a, b) => a.from - b.from);
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].from - sorted[i - 1].to < 0.25) out.push(`${sorted[i - 1].id} → ${sorted[i].id}: пауза меньше 0,25 с`);
  }
  for (const c of tl.cues) {
    const sc = tl.scenes.find((s) => s.id === c.scene)!;
    if (c.from < sc.from || c.to > sc.to - 0.2) out.push(`${c.id}: выходит за сцену ${sc.id}`);
  }
  const cta = tl.scenes.find((s) => s.id === "cta")!;
  if (tl.durationSec - tl.lastWordEnd < 3) out.push(`после последнего слова ${(tl.durationSec - tl.lastWordEnd).toFixed(2)} с (< 3 с)`);
  if (tl.durationSec - (cta.from + BG18_CONTACTS_IN) < 5) out.push("контакты на экране меньше 5 с");
  return out;
};

// Через сколько секунд от начала финальной сцены все контакты на экране.
export const BG18_CONTACTS_IN = 0.8;
