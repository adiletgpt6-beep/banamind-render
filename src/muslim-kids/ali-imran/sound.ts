// Звуковой дизайн без музыки: только шумовые «воздушные» текстуры и звуки природы
// (файлы — scripts/muslim-kids/sfx.mjs). Голос всегда главный: эффекты тихие.
import type { Plan } from "./choreo";
import type { Cues } from "./timeline";

export type Cue = {
  file: string;
  at: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
  dur?: number;
};

export const soundCues = (c: Cues, p: Plan): Cue[] => {
  const s = (id: string) => c.scene(id);
  const w = (line: string, word: number | string) => c.word(line, word);
  return [
    { file: "spark.wav", at: 2, volume: 0.22 },
    { file: "whoosh-soft.wav", at: w("s1a", 0) - 8, volume: 0.2 },
    { file: "spark.wav", at: w("s1a", 0) + 6, volume: 0.16 },
    { file: "whoosh.wav", at: w("s1b", "светло") - 10, volume: 0.22 },
    { file: "thump.wav", at: w("s1c", "почему") - 3, volume: 0.32 },
    { file: "whoosh.wav", at: s("s2").from - 4, volume: 0.2 },
    { file: "spark.wav", at: s("s2").from + 30, volume: 0.14 },
    {
      file: "air.wav",
      at: s("s3").from,
      volume: 0.16,
      fadeIn: 30,
      fadeOut: 40,
      dur: s("s3").dur + 10,
    },
    { file: "whoosh-soft.wav", at: s("s3").from + 4, volume: 0.2 },
    { file: "whoosh.wav", at: w("s3a", "узнать") - 8, volume: 0.16 },
    { file: "spark.wav", at: w("s3a", "задуматься") - 4, volume: 0.18 },
    { file: "whoosh-soft.wav", at: w("s3a", "творении") - 6, volume: 0.22 },
    { file: "whoosh-soft.wav", at: w("s4b", "небо") - 10, volume: 0.15 },
    { file: "whoosh-soft.wav", at: w("s4b", "земля") - 8, volume: 0.15 },
    { file: "whoosh-soft.wav", at: w("s4b", "смена") - 8, volume: 0.15 },
    { file: "spark.wav", at: w("s4b", "знамения") - 4, volume: 0.18 },
    {
      file: "nature.wav",
      at: s("s5").from,
      volume: 0.2,
      fadeIn: 20,
      fadeOut: 45,
      dur: p.riseFrom - s("s5").from + 50,
    },
    { file: "drop.wav", at: p.impact - 1, volume: 0.42 },
    { file: "ripple.wav", at: p.impact + 3, volume: 0.24 },
    { file: "spark.wav", at: p.treeAt + 6, volume: 0.15 },
    { file: "rise.wav", at: p.riseFrom - 4, volume: 0.2 },
    {
      file: "air.wav",
      at: s("s6").from - 20,
      volume: 0.13,
      fadeIn: 40,
      fadeOut: 30,
      dur: s("s6").dur + s("s7").dur + 20,
    },
    {
      file: "night.wav",
      at: s("s7").from,
      volume: 0.16,
      fadeIn: 30,
      fadeOut: 40,
      dur: s("s7").dur,
    },
    { file: "spark.wav", at: w("s7b", "небо") - 2, volume: 0.17 },
    { file: "whoosh-soft.wav", at: c.line("s7c").speechTo + 4, volume: 0.22 },
    { file: "spark.wav", at: c.line("s7c").speechTo + 26, volume: 0.15 },
  ];
};
