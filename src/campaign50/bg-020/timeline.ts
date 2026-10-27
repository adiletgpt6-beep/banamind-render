// Шкала BG-020 по фактической озвучке: начало и конец каждой сцены и
// реплики. Для губ — тайминги букв ElevenLabs и огибающая громкости файла
// (как в 2D-роликах проекта). Без озвучки — оценка по тексту (только для
// предпросмотра; финальный рендер требует manifest.json, см. manifest.ts).
// Без зависимостей от Remotion (читается и Node-скриптами).
import { CHAR_LAG, estimateLine, type Ts2Char, type Ts2Cue, type Ts2ManifestLine, type Ts2Word } from "../../two-schedules-2d/timing.ts";
import type { Ts2Line } from "../../two-schedules-2d/script.ts";
import { BG020_CONTACTS_AT, BG020_HOLD_AFTER_VOICE, BG020_LINES, BG020_SCENES, BG020_VIDEO, type Bg020SceneId } from "./script.ts";

export type Bg020ManifestLine = Ts2ManifestLine & { readonly text?: string; readonly spoken?: string };
export type Bg020Manifest = {
  readonly version: 1;
  readonly kind: "bg020";
  readonly estimated?: boolean;
  readonly partial?: boolean;
  readonly lines: readonly Bg020ManifestLine[];
};

export type Bg020SceneSpan = { readonly id: Bg020SceneId; readonly from: number; readonly to: number };
export type Bg020Timeline = {
  readonly scenes: readonly Bg020SceneSpan[];
  readonly cues: readonly Ts2Cue[];
  readonly durationSec: number;
  readonly durationInFrames: number;
  readonly contactsFrom: number; // с, начало показа контактов
  readonly lastWordAt: number; // с
};

export const estimateBg020Manifest = (): Bg020Manifest => ({
  version: 1,
  kind: "bg020",
  estimated: true,
  lines: BG020_LINES.map((l) => estimateLine(l as unknown as Ts2Line)),
});

const FPS = BG020_VIDEO.fps;
const r3 = (x: number) => Math.round(x * 1000) / 1000;

export const buildBg020Timeline = (m: Bg020Manifest): Bg020Timeline => {
  const scenes: Bg020SceneSpan[] = [];
  const cues: Ts2Cue[] = [];
  let t = 0;
  for (const sc of BG020_SCENES) {
    // начало сцены — на целом кадре
    const from = Math.round(t * FPS) / FPS;
    let cursor = from + sc.lead;
    let lastEnd = from;
    BG020_LINES.filter((l) => l.scene === sc.id).forEach((l, i) => {
      const ml = m.lines.find((x) => x.id === l.id) ?? estimateLine(l as unknown as Ts2Line);
      const est = ml.chars && ml.env ? ml : { ...estimateLine(l as unknown as Ts2Line), ...ml };
      const at = r3(i === 0 ? cursor : lastEnd + (l.gap ?? 0.5));
      const shift = at - ml.speechStart;
      const end = at + (ml.speechEnd - ml.speechStart);
      cues.push({
        id: l.id,
        role: l.role,
        file: ml.file,
        audioFrom: shift,
        durationSec: ml.durationSec,
        from: at,
        to: end,
        words: (ml.words ?? est.words ?? []).map((w: Ts2Word) => ({ text: w.text, start: w.start + shift, end: w.end + shift })),
        chars: (est.chars ?? []).map((c: Ts2Char) => ({
          c: c.c,
          start: c.start + shift + (ml.chars ? CHAR_LAG : 0),
          end: c.end + shift + (ml.chars ? CHAR_LAG : 0),
        })),
        env: est.env ?? [],
      });
      lastEnd = end;
      cursor = end;
    });
    const to = Math.max(from + sc.minSec, lastEnd + sc.tail);
    scenes.push({ id: sc.id, from, to: Math.round(to * FPS) / FPS });
    t = to;
  }
  const last = scenes[scenes.length - 1];
  const lastWordAt = Math.max(...cues.map((c) => c.to));
  const durationInFrames = Math.round(last.to * FPS);
  return {
    scenes,
    cues,
    durationSec: durationInFrames / FPS,
    durationInFrames,
    contactsFrom: last.from + BG020_CONTACTS_AT,
    lastWordAt,
  };
};

// Проверка готовой шкалы: реплики не накладываются, файлы не начинаются
// раньше 0 с, контакты видны ≥ 5 с, после последнего слова ≥ 3 с.
export const checkBg020Timeline = (tl: Bg020Timeline): string[] => {
  const problems: string[] = [];
  tl.cues.forEach((c, i) => {
    const next = tl.cues[i + 1];
    if (next && c.to + 0.25 > next.from) problems.push(`${c.id}: накладывается на ${next.id}`);
    if (c.audioFrom < 0) problems.push(`${c.id}: файл начинается раньше 0 с`);
  });
  if (tl.durationSec - tl.contactsFrom < 5) problems.push(`контакты видны только ${(tl.durationSec - tl.contactsFrom).toFixed(2)} с`);
  if (tl.durationSec - tl.lastWordAt < BG020_HOLD_AFTER_VOICE) problems.push(`после последнего слова только ${(tl.durationSec - tl.lastWordAt).toFixed(2)} с`);
  return problems;
};

export const sceneSpan = (tl: Bg020Timeline, id: Bg020SceneId) => tl.scenes.find((s) => s.id === id)!;
