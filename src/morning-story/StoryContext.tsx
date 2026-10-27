import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import type { RoleId, StorySceneId } from "./script";
import {
  buildStoryTimeline,
  estimateStoryManifest,
  type LineTiming,
  type StoryTimeline,
} from "./storyTimeline";

// Монтаж истории доступен всем сценам (начала сцен и реплик в кадрах).
const fallback = buildStoryTimeline(estimateStoryManifest());
export const StoryContext = createContext<StoryTimeline>(fallback);
export const useStory = () => useContext(StoryContext);

const findLine = (tl: StoryTimeline, id: string): LineTiming => {
  const line = tl.lines.find((l) => l.id === id);
  if (!line) throw new Error(`Нет реплики «${id}».`);
  return line;
};

export const sceneFrom = (tl: StoryTimeline, id: StorySceneId) =>
  tl.scenes.find((s) => s.id === id)?.from ?? 0;

// Реплика в кадрах ОТНОСИТЕЛЬНО начала сцены: начало и конец речи.
export const useLineCue = (sceneId: StorySceneId, lineId: string) => {
  const tl = useStory();
  const line = findLine(tl, lineId);
  const base = sceneFrom(tl, sceneId);
  return { start: line.speechFrom - base, end: line.speechTo - base };
};

// Кадр (относительно сцены), когда звучит слово реплики (начало слова).
export const useWordCue = (
  sceneId: StorySceneId,
  lineId: string,
  word: string,
  nth = 0,
) => {
  const tl = useStory();
  const line = findLine(tl, lineId);
  const base = sceneFrom(tl, sceneId);
  const key = word.toLowerCase();
  const hits = line.words.filter((w) =>
    w.text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .startsWith(key),
  );
  const hit = hits[nth] ?? hits[0];
  return (hit ? hit.from : line.speechFrom) - base;
};

// Длительность сцены в кадрах.
export const useSceneLength = (sceneId: StorySceneId) => {
  const tl = useStory();
  return tl.scenes.find((s) => s.id === sceneId)?.durationInFrames ?? 1;
};

// «Губы»: открытость рта 0…1 для роли в текущем кадре сцены — по таймингам
// слов реплик этой роли (внутри слова рот двигается, между словами закрыт).
export const useMouth = (sceneId: StorySceneId, role: RoleId) => {
  const tl = useStory();
  const frame = useCurrentFrame();
  const abs = sceneFrom(tl, sceneId) + frame;
  for (const line of tl.lines) {
    if (line.role !== role) continue;
    if (abs < line.speechFrom - 1 || abs > line.speechTo + 1) continue;
    for (const w of line.words) {
      if (abs >= w.from && abs <= w.to) {
        const len = Math.max(2, w.to - w.from);
        const syll = Math.max(1, Math.round(w.text.length / 2.6));
        const ph = ((abs - w.from) / len) * syll * Math.PI;
        return 0.25 + 0.75 * Math.abs(Math.sin(ph + 0.4));
      }
    }
    return 0.08;
  }
  return 0;
};
