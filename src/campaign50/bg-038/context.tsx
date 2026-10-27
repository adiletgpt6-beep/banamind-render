// Общее для сцен BalaGoBG038: шкала (сцены и реплики по фактической
// озвучке), кадр сцены → кадр ролика, окно камеры на мир сцены.
import { createContext, useContext } from "react";
import { BG38_VIDEO, type Bg38SceneId } from "./script";
import { buildBg38Timeline, estimateBg38Manifest, lineFramesIn, sceneOf, wordFrameIn, wordIndexOf, type Bg38Timeline } from "./timing";

export const TimelineContext = createContext<Bg38Timeline>(buildBg38Timeline(estimateBg38Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg38SceneId) => {
  const s = sceneOf(useTimeline(), id);
  return Math.round((s.to - s.from) * BG38_VIDEO.fps);
};
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
export const useWord = (id: string, i: number) => wordFrameIn(useTimeline(), id, i);
// Кадр сцены, когда звучит фрагмент текста реплики (первое его слово).
export const useSaid = (id: string, needle: string) => wordFrameIn(useTimeline(), id, wordIndexOf(id, needle));

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Окно на мир сцены во весь кадр: cam — точка мира в центре кадра и масштаб.
export const World: React.FC<{
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly filter?: string;
}> = ({ cam, bg, children, filter }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: "0 0",
        transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
        filter,
      }}
    >
      {children}
    </div>
  </div>
);

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
