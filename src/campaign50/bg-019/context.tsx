// Общее для сцен BalaGoBG019: шкала (сцены и реплики по фактической
// озвучке), кадр сцены → кадр ролика, панели разделённого экрана.
import { createContext, useContext } from "react";
import { BG19_VIDEO, type Bg19SceneId } from "./script";
import { buildBg19Timeline, estimateBg19Manifest, lineFramesIn, sceneOf, wordFrameIn, type Bg19Timeline } from "./timing";

export const TimelineContext = createContext<Bg19Timeline>(buildBg19Timeline(estimateBg19Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg19SceneId) => {
  const s = sceneOf(useTimeline(), id);
  return Math.round((s.to - s.from) * BG19_VIDEO.fps);
};
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
export const useWord = (id: string, i: number) => wordFrameIn(useTimeline(), id, i);

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Окно на мир сцены: часть кадра (top…top+height) со своей камерой.
// cam — точка мира в центре окна и масштаб.
export const Panel: React.FC<{
  readonly top: number;
  readonly height: number;
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly filter?: string;
}> = ({ top, height, cam, bg, children, overlay, filter }) => {
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
