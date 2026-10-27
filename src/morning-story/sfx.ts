import type { StorySfx } from "./StoryAudio";
import type { StoryTimeline } from "./storyTimeline";

// Звуковые эффекты — умеренно, только на ключевых действиях. Кадры —
// относительно начала сцены; моменты привязаны к репликам.
export const STORY_SFX = (tl: StoryTimeline): StorySfx[] => {
  const scene = (id: StorySfx["scene"]) =>
    tl.scenes.find((s) => s.id === id)!.from;
  const line = (id: string) => tl.lines.find((l) => l.id === id)!;
  const rel = (sceneId: StorySfx["scene"], abs: number) => abs - scene(sceneId);
  const sceneLen = (id: StorySfx["scene"]) =>
    tl.scenes.find((s) => s.id === id)!.durationInFrames;
  return [
    { scene: "s01Morning", at: 6, sound: "alarm", volume: 0.35 },
    { scene: "s02Plan", at: 10, sound: "vibrate", volume: 0.55 },
    { scene: "s03Order", at: 20, sound: "tap", volume: 0.6 },
    { scene: "s04First", at: 30, sound: "tick", volume: 0.4 },
    {
      scene: "s04First",
      at: rel("s04First", line("m02").speechTo) + 12,
      sound: "tap",
      volume: 0.55,
    },
    {
      scene: "s04First",
      at: rel("s04First", line("m02").speechTo) + 16,
      sound: "ringback",
      volume: 0.35,
    },
    {
      scene: "s04First",
      at: rel("s04First", line("m03").speechTo) + 10,
      sound: "tap",
      volume: 0.55,
    },
    { scene: "s05Second", at: 0, sound: "whoosh", volume: 0.25 },
    { scene: "s05Second", at: 18, sound: "tap", volume: 0.5 },
    { scene: "s06Traffic", at: 0, sound: "traffic", volume: 0.45 },
    {
      scene: "s06Traffic",
      at: Math.min(sceneLen("s06Traffic") - 300, 300),
      sound: "traffic",
      volume: 0.4,
    },
    { scene: "s07Ride", at: 4, sound: "car", volume: 0.5 },
    {
      scene: "s07Ride",
      at: rel("s07Ride", line("t02").speechTo) + 16,
      sound: "car",
      volume: 0.28,
    },
    { scene: "s08School", at: 6, sound: "bell", volume: 0.4 },
    { scene: "s09Office", at: 20, sound: "typing", volume: 0.3 },
    {
      scene: "s10Idea",
      at: rel("s10Idea", line("n05").speechFrom) - 26,
      sound: "notify",
      volume: 0.45,
    },
    {
      scene: "s10Idea",
      at: sceneLen("s10Idea") - 22,
      sound: "tap",
      volume: 0.55,
    },
    { scene: "s11Call", at: 2, sound: "ringback", volume: 0.3 },
    { scene: "s12Final", at: 6, sound: "pop", volume: 0.25 },
  ];
};
