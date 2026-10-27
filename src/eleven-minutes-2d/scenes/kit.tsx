// Общие помощники сцен: время сцены, слова реплик, раскладка.
import { useContext } from "react";
import { useCurrentFrame } from "remotion";
import { CuesContext } from "../context";
import { EM2_SCENES, EM2_VIDEO, type Em2SceneId } from "../script";
import { LAYOUT } from "../theme";

export const FPS = EM2_VIDEO.fps;
export const STAGE = LAYOUT.stage;
export const sceneStart = (id: Em2SceneId) => EM2_SCENES.find((s) => s.id === id)!.from;

// Кадр сцены, время ролика (с) и помощники по репликам.
export const useScene = (id: Em2SceneId) => {
  const f = useCurrentFrame();
  const cues = useContext(CuesContext);
  const t0 = sceneStart(id);
  const t = t0 + f / FPS;
  const cue = (lineId: string) => {
    const c = cues.find((x) => x.id === lineId);
    if (!c) throw new Error(`Нет реплики ${lineId}`);
    return c;
  };
  // кадр сцены начала/конца реплики и начала слова i
  const from = (lineId: string) => Math.round((cue(lineId).from - t0) * FPS);
  const to = (lineId: string) => Math.round((cue(lineId).to - t0) * FPS);
  const word = (lineId: string, i: number) => {
    const c = cue(lineId);
    const w = c.words[i];
    return Math.round(((w ? w.start : c.from + ((c.to - c.from) * i) / Math.max(1, c.words.length || 8)) - t0) * FPS);
  };
  return { f, t, t0, from, to, word, cue };
};
