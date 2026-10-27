import { createContext, useContext } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { NB_SHOTS, wordsAbs, type NBPlacedLine, type NBShotId } from "./timeline";

export const NBContext = createContext<readonly NBPlacedLine[]>([]);

// Время сцены в секундах ролика (абсолютное): кадр внутри Sequence + начало.
export const useShotTime = (id: NBShotId) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const shot = NB_SHOTS.find((s) => s.id === id)!;
  return shot.from + frame / fps;
};

export const useLines = () => useContext(NBContext);

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
