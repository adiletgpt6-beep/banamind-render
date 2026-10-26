// Планы и камера для кадра 1920×1080. Мир сцены рисуется в своих px;
// камера — точка мира в центре кадра и масштаб. Смена плана — обычная
// склейка; внутри плана допустимо спокойное движение камеры.
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "./rig/motion";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };
export const CAM_WIDE: Cam = { x: 960, y: 540, zoom: 1 };

const CamContext = createContext<{ cam: Cam; base: Cam }>({ cam: CAM_WIDE, base: CAM_WIDE });

export const camMove = (f: number, from: number, to: number, a: Cam, b: Cam, ease = easeInOut): Cam => {
  const t = ease((f - from) / Math.max(1, to - from));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) };
};

export const Shot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ f, from, to, cam, base, children, overlay }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${960 - cam.x * cam.zoom}px, ${540 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          }}
        >
          {children}
        </div>
      </CamContext.Provider>
      {overlay}
    </div>
  );
};

// Слой глубины: depth 1 — вместе с миром, 0 — неподвижен относительно кадра.
export const Depth: React.FC<{ readonly depth: number; readonly children: React.ReactNode }> = ({ depth, children }) => {
  const { cam, base } = useContext(CamContext);
  const dx = (cam.x - base.x) * (1 - depth);
  const dy = (cam.y - base.y) * (1 - depth) * 0.6;
  return <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${dx}px, ${dy}px)` }}>{children}</div>;
};

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
