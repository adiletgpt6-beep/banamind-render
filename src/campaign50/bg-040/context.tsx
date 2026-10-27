// Общее для сцен BalaGoBG040: шкала (сцены и реплики по фактической
// озвучке), кадры реплик и слов, окно камеры на мир сцены.
import { createContext, useContext } from "react";
import { type Bg40SceneId } from "./script";
import { buildBg40Timeline, estimateBg40Manifest, lineFramesIn, sceneFrames, wordFrameIn, wordIndex, type Bg40Timeline } from "./timing";

export const TimelineContext = createContext<Bg40Timeline>(buildBg40Timeline(estimateBg40Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg40SceneId) => sceneFrames(useTimeline(), id);
// Начало и конец реплики (кадры сцены).
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
// Кадр сцены, когда звучит слово реплики (по началу слова).
export const useWord = (id: string, prefix: string, nth = 0) => wordFrameIn(useTimeline(), id, wordIndex(id, prefix, nth));

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Окно на мир сцены: часть кадра (top…top+height) со своей камерой.
// cam — точка мира в центре окна и масштаб.
export const Panel: React.FC<{
  readonly top?: number;
  readonly height?: number;
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly filter?: string;
}> = ({ top = 0, height = 1920, cam, bg, children, overlay, filter }) => {
  if (height <= 0.5) return null;
  return (
    <div style={{ position: "absolute", left: 0, top, width: 1080, height, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          transformOrigin: "0 0",
          transform: `translate(${540 - cam.x * cam.zoom}px, ${height / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          filter,
        }}
      >
        {children}
      </div>
      {overlay}
    </div>
  );
};

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
