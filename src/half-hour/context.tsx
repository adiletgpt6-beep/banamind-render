import { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { HH_SHOTS, wordsAbs, type HHPlacedLine, type HHShotId } from "./timeline";

export const HHRenderScaleContext = createContext(1);

export const HHContext = createContext<readonly HHPlacedLine[]>([]);

// Время сцены в секундах ролика (абсолютное): кадр внутри Sequence + начало.
export const useShotTime = (id: HHShotId) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shot = HH_SHOTS.find((s) => s.id === id)!;
  return shot.from + frame / fps;
};

export const useLines = () => useContext(HHContext);

// Слова реплик (абсолютное время) — для губ; и границы речи.
export const useSpeech = (ids: readonly string[]) => {
  const lines = useLines();
  const out: Record<string, { words: ReturnType<typeof wordsAbs>; from: number; to: number }> = {};
  for (const id of ids) {
    const l = lines.find((x) => x.id === id);
    out[id] = { words: wordsAbs(l), from: l?.speechFromSec ?? 0, to: l?.speechToSec ?? 0 };
  }
  return out;
};
