// AudioSyncSystem — every cue is derived from the measured narration
// (src/timeline.json, written by scripts/generate-voice.py). Seconds.
import timeline from "../timeline.json";

export const FPS = timeline.fps;
export const DURATION_IN_FRAMES = timeline.durationInFrames;
export const TOTAL = DURATION_IN_FRAMES / FPS;

const sentences = timeline.sentences;
const s = (i: number) => sentences[i];
export const SENTENCES = sentences;

export const SCENES = {
  earth: [0, 6],
  earthLayers: [6, 15],
  mountains: [15, 25],
  leaf: [25, 35],
  grand: [35, 44.6],
  quran: [44.6, 53.2],
  ending: [53.2, TOTAL],
} as const;

export const CUE = {
  // Scene 1
  intro: 0,
  seam: s(0).end - 0.1, // golden seam appears before "Посмотри!"
  look: s(1).start, // "Посмотри!" → segment lifts
  // Scene 2
  rotation: s(2).start, // "Земля вращается…"
  dayNight: s(2).start + 1.2, // "…день сменяет ночь"
  inside: s(3).start, // "А внутри у планеты…"
  layers: s(3).end - 0.75, // "…слои!"
  // Scene 3
  mountains: s(4).start, // "горы"
  peaks: s(5).start, // "вершины"
  rocks: s(6).start, // "Но под поверхностью…"
  // Scene 4
  leaf: s(7).start, // "листочек"
  green: s(8).start, // "Снаружи он зелёный"
  veins: s(9).start + 0.9, // "прожилки"
  cells: s(9).end - 1.0, // "клеток"
  // Scene 5
  surah: s(10).start,
  ayah: s(11).start,
  // Scene 6
  believers: s(12).start,
  quote: s(13).start,
  // Scene 7
  question: s(14).start,
  lookAround: s(15).start,
} as const;
