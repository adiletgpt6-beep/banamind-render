// IslamicFinanceShort01 — "What If Banks Couldn't Charge Interest?"
// A 30-second vertical explainer (YouTube Shorts, US audience) about murabaha,
// the cost-plus sale used in Islamic finance.
//
// Everything that depends on time lives here: the video spec, the eight
// storyboard scenes and the narration lines with their planned start times.
// Actual speech timings come from the narration manifest
// (public/audio/islamic-finance-01/manifest.json, scripts/generate-if01-voice.mjs).

export const IF01_VIDEO = {
  id: "IslamicFinanceShort01",
  width: 1080,
  height: 1920,
  fps: 30,
  durationSec: 30,
  voiceDir: "audio/islamic-finance-01",
  output: "islamic-finance-short-01.mp4",
} as const;

export const IF01_FRAMES = IF01_VIDEO.durationSec * IF01_VIDEO.fps; // 900

export type If01SceneId =
  | "hook"
  | "rule"
  | "question"
  | "car"
  | "deal"
  | "name"
  | "takeaway"
  | "cta";

export type If01Scene = {
  readonly id: If01SceneId;
  readonly title: string;
  readonly from: number; // seconds
  readonly to: number; // seconds
};

// Storyboard (seconds). Scenes are contiguous; the composition adds its own
// overlaps for the hand-offs between them.
export const IF01_SCENES: readonly If01Scene[] = [
  { id: "hook", title: "The hook", from: 0, to: 3 },
  { id: "rule", title: "The rule", from: 3, to: 6.5 },
  { id: "question", title: "The question", from: 6.5, to: 9 },
  { id: "car", title: "The car example", from: 9, to: 13 },
  { id: "deal", title: "The transaction", from: 13, to: 22 },
  { id: "name", title: "The name", from: 22, to: 24.5 },
  { id: "takeaway", title: "The takeaway", from: 24.5, to: 27.5 },
  { id: "cta", title: "Ending / call to action", from: 27.5, to: 30 },
];

export type If01Line = {
  readonly id: string;
  readonly scene: If01SceneId;
  /** Text as written (used for captions). */
  readonly text: string;
  /** Planned start of speech, seconds. */
  readonly at: number;
  /** Latest moment the speech may end (seconds) without colliding with the next scene. */
  readonly endBy: number;
  /** Words that get the green/yellow emphasis in captions (lowercase, no punctuation). */
  readonly emphasis?: readonly string[];
};

// Final voiceover script (do not rewrite). 63 words ≈ 23 s of speech.
export const IF01_LINES: readonly If01Line[] = [
  {
    id: "l1",
    scene: "hook",
    text: "What if banks couldn't charge interest?",
    at: 0.25,
    endBy: 2.9,
    emphasis: ["interest"],
  },
  {
    id: "l2",
    scene: "rule",
    text: "In Islamic finance, riba is prohibited.",
    at: 3.2,
    endBy: 6.3,
    emphasis: ["riba", "prohibited"],
  },
  {
    id: "l3",
    scene: "question",
    text: "So how does financing work?",
    at: 6.7,
    endBy: 8.9,
    emphasis: ["financing"],
  },
  {
    id: "l4",
    scene: "car",
    text: "Let's say a car costs twenty thousand dollars.",
    at: 9.2,
    endBy: 12.9,
    emphasis: ["twenty", "thousand", "dollars"],
  },
  {
    id: "l5",
    scene: "deal",
    text: "In one model, a financier buys it, then resells it to you for an agreed twenty-two thousand, paid in installments.",
    at: 13.1,
    endBy: 21.8,
    emphasis: ["buys", "resells", "agreed", "twenty-two", "thousand", "installments"],
  },
  {
    id: "l6",
    scene: "name",
    text: "It's called murabaha.",
    at: 22.2,
    endBy: 24.4,
    emphasis: ["murabaha"],
  },
  {
    id: "l7",
    scene: "takeaway",
    text: "Not free money — a different kind of contract.",
    at: 24.6,
    endBy: 27.4,
    emphasis: ["different", "contract"],
  },
  {
    id: "l8",
    scene: "cta",
    text: "Follow for more finance explained.",
    at: 27.5,
    endBy: 29.8,
    emphasis: ["follow"],
  },
];

// Pronunciation guidance for the narrator / TTS.
export const IF01_PRONUNCIATION = {
  riba: "REE-bah",
  murabaha: "moo-RAH-bah-hah",
} as const;

export const lineById = (id: string): If01Line => {
  const line = IF01_LINES.find((l) => l.id === id);
  if (!line) throw new Error(`Unknown narration line: ${id}`);
  return line;
};

export const sceneById = (id: If01SceneId): If01Scene =>
  IF01_SCENES.find((s) => s.id === id)!;
