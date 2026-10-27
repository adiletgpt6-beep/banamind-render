// Общее для сцен BalaGoBG039: шкала (сцены и реплики по фактической
// озвучке), кадр сцены → кадр ролика, губы персонажей.
//
// Персонажи рисуются готовым 2D-ригом ролика №12 (src/two-schedules-2d/rig,
// только импорт, файлы не меняются). Риг берёт губы из его CuesContext и
// начало сцены из SceneContext — их заполняет BalaGoBG039.tsx репликами
// BG-039 (роли narrator/father совпадают с ролями рига).
import { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { BG39_VIDEO, type Bg39SceneId } from "./script";
import { buildBg39Timeline, estimateBg39Manifest, lineFramesIn, sceneOf, wordFrameAt, type Bg39Timeline } from "./timing";

const FPS = BG39_VIDEO.fps;

// Кадр сцены (0 — её начало по шкале; во время наплыва из предыдущей
// сцены — отрицательный). PreContext задаёт главная композиция.
export const PreContext = createContext(0);
export const useSceneFrame = () => useCurrentFrame() - useContext(PreContext);

export const TimelineContext = createContext<Bg39Timeline>(buildBg39Timeline(estimateBg39Manifest()));
export const useTimeline = () => useContext(TimelineContext);

// Длительность сцены в кадрах.
export const useSceneFrames = (id: Bg39SceneId) => {
  const s = sceneOf(useTimeline(), id);
  return Math.round((s.to - s.from) * FPS);
};
export const useLine = (id: string) => lineFramesIn(useTimeline(), id);
// Кадр сцены, когда звучит слово (по началу слова).
export const useWordAt = (id: string, prefix: string, fallback: number, nth = 0) => wordFrameAt(useTimeline(), id, prefix, fallback, nth);

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

// Окно на мир сцены (весь кадр) со своей камерой: cam — точка мира
// в центре кадра и масштаб.
export const World: React.FC<{
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly filter?: string;
}> = ({ cam, bg, children, filter }) => (
  <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
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
