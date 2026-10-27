// Шкала BalaGoBG021 по фактической озвучке (manifest.json) или по оценке
// (если озвучки ещё нет: Studio, контрольные кадры без ключа ElevenLabs).
// Файл без зависимостей от Remotion.
import { BG021_LINE_GAP, BG021_LINES, BG021_SCENES, BG021_VIDEO, spokenWords, type Bg021Line, type Bg021SceneId } from "./script.ts";

export type Bg021Word = { readonly text: string; readonly start: number; readonly end: number };

export type Bg021ManifestLine = {
  readonly id: string;
  readonly file: string;
  readonly spoken: string;
  readonly hash?: string;
  readonly durationSec: number;
  readonly speechStart: number;
  readonly speechEnd: number;
  readonly words: readonly Bg021Word[];
};

export type Bg021Manifest = { readonly version: 1; readonly video: string; readonly lines: readonly Bg021ManifestLine[] };

export type Bg021Cue = {
  readonly id: string;
  readonly scene: Bg021SceneId;
  readonly line: Bg021Line;
  readonly file: string | null;
  readonly audioFrom: number; // начало файла, с
  readonly durationSec: number;
  readonly from: number; // начало речи, с
  readonly to: number; // конец речи, с
  readonly words: readonly Bg021Word[]; // абсолютное время, с
};

export type Bg021Timeline = {
  readonly scenes: readonly { readonly id: Bg021SceneId; readonly title: string; readonly from: number; readonly to: number }[];
  readonly cues: readonly Bg021Cue[];
  readonly totalSec: number;
  readonly totalFrames: number;
  readonly voiced: boolean;
};

const FPS = BG021_VIDEO.fps;
const snap = (t: number) => Math.round(t * FPS) / FPS;

// Оценка речи без файла: ≈13 букв в секунду, слова — пропорционально длине.
const estimateLine = (line: Bg021Line): Bg021ManifestLine => {
  const words = spokenWords(line.spoken);
  const letters = words.reduce((n, w) => n + w.length, 0);
  const speech = Math.max(1.2, line.spoken.length / 13);
  let t = 0.15;
  const out: Bg021Word[] = [];
  for (const w of words) {
    const d = (w.length / letters) * speech;
    out.push({ text: w, start: t, end: t + d * 0.92 });
    t += d;
  }
  return { id: line.id, file: "", spoken: line.spoken, durationSec: t + 0.2, speechStart: 0.15, speechEnd: t, words: out };
};

// Реплика берётся из манифеста только если её текст совпадает со сценарием.
export const usableManifestLine = (m: Bg021Manifest | null, line: Bg021Line) => {
  const ml = m?.lines.find((x) => x.id === line.id);
  return ml && ml.file && ml.spoken === line.spoken ? ml : null;
};

export const buildBg021Timeline = (manifest: Bg021Manifest | null): Bg021Timeline => {
  const scenes: { id: Bg021SceneId; title: string; from: number; to: number }[] = [];
  const cues: Bg021Cue[] = [];
  let t0 = 0;
  let voiced = true;
  for (const sc of BG021_SCENES) {
    let cursor = t0 + sc.leadSec;
    let speechEnd = t0;
    for (const line of BG021_LINES.filter((l) => l.scene === sc.id)) {
      const real = usableManifestLine(manifest, line);
      if (!real) voiced = false;
      const ml = real ?? estimateLine(line);
      const audioFrom = snap(cursor - ml.speechStart);
      cues.push({
        id: line.id,
        scene: sc.id,
        line,
        file: real ? real.file : null,
        audioFrom,
        durationSec: ml.durationSec,
        from: audioFrom + ml.speechStart,
        to: audioFrom + ml.speechEnd,
        words: ml.words.map((w) => ({ text: w.text, start: audioFrom + w.start, end: audioFrom + w.end })),
      });
      speechEnd = audioFrom + ml.speechEnd;
      cursor = speechEnd + BG021_LINE_GAP;
    }
    const to = snap(Math.max(t0 + sc.minSec, speechEnd + sc.tailSec));
    scenes.push({ id: sc.id, title: sc.title, from: t0, to });
    t0 = to;
  }
  return { scenes, cues, totalSec: t0, totalFrames: Math.round(t0 * FPS), voiced };
};

export const sceneOf = (tl: Bg021Timeline, id: Bg021SceneId) => tl.scenes.find((s) => s.id === id)!;
export const cueOf = (tl: Bg021Timeline, id: string) => tl.cues.find((c) => c.id === id)!;
