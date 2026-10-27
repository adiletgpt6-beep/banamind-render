// Общие помощники сцен: кадры реплик и слов относительно начала сцены
// (по фактической озвучке или оценке). Используются и в сценах, и в плане
// звуковых эффектов, чтобы движение и звук совпадали.
import { useTimeline } from "../context";
import { BG36_VIDEO, type Bg36SceneId } from "../script";
import { sceneOf, type Bg36Scene, type Bg36Timeline } from "../timing";

const FPS = BG36_VIDEO.fps;

export type ScenePlanArgs = { readonly tl: Bg36Timeline; readonly sc: Bg36Scene };

// Начало/конец реплики id в кадрах сцены.
export const lineF = ({ tl, sc }: ScenePlanArgs, id: string) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  return { from: Math.round(c.from * FPS) - sc.from, to: Math.round(c.to * FPS) - sc.from };
};

// Кадр сцены, когда начинается слово i реплики id (слова текста без тире).
// Неверный индекс — ошибка: правка текста не должна молча сдвигать действие.
export const wordF = ({ tl, sc }: ScenePlanArgs, id: string, i: number) => {
  const c = tl.cues.find((x) => x.id === id);
  if (!c) throw new Error(`Нет реплики ${id}`);
  if (!Number.isInteger(i) || i < 0 || i >= c.words.length)
    throw new Error(`Реплика ${id}: нет слова №${i} (всего ${c.words.length})`);
  return Math.round(c.words[i].start * FPS) - sc.from;
};

export const sec = (s: number) => Math.round(s * FPS);


// Шкала и текущая сцена (для плана сцены внутри компонента).
export const useSceneArgs = (id: Bg36SceneId): ScenePlanArgs => {
  const tl = useTimeline();
  return { tl, sc: sceneOf(tl, id) };
};
