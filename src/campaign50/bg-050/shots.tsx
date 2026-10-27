// Планы, камера и «плитки» мозаики. Мир сцены рисуется в своих
// координатах (px); камера — точка мира в центре окна и масштаб s
// (px экрана на px мира). Одна и та же живая сцена показывается и на весь
// кадр, и маленькой плиткой мозаики (View с прямоугольником и скруглением).
// Дальние слои (Depth) при движении камеры смещаются меньше — глубина.
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "./rig/motion";

export type Cam = { readonly x: number; readonly y: number; readonly s: number };
export type Rect = { readonly x: number; readonly y: number; readonly w: number; readonly h: number; readonly r?: number };

export const FULL: Rect = { x: 0, y: 0, w: 1080, h: 1920, r: 0 };

const CamContext = createContext<{ cam: Cam; base: Cam }>({
  cam: { x: 540, y: 960, s: 1 },
  base: { x: 540, y: 960, s: 1 },
});

// Спокойное движение камеры между двумя положениями.
export const camMove = (f: number, from: number, to: number, a: Cam, b: Cam, ease = easeInOut): Cam => {
  const t = ease((f - from) / Math.max(1, to - from));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), s: lerp(a.s, b.s, t) };
};

// Камера по ключам: [[кадр, cam], …], между ключами — плавно.
export const camKeys = (f: number, pts: readonly (readonly [number, Cam])[], ease = easeInOut): Cam => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, c1] = pts[i];
    const [t0, c0] = pts[i - 1];
    if (f <= t1) return camMove(f, t0, t1, c0, c1, ease);
  }
  return pts[pts.length - 1][1];
};

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r ?? 0, b.r ?? 0, t),
});

// Камера, показывающая тот же участок мира в окне другого размера:
// масштаб пропорционален ширине окна.
export const fitCam = (cam: Cam, rect: Rect): Cam => ({ ...cam, s: (cam.s * rect.w) / 1080 });

// Окно в мир: прямоугольник экрана (rect) с камерой cam.
export const View: React.FC<{
  readonly rect?: Rect;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly bg?: string;
  readonly shadow?: boolean;
  readonly opacity?: number;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ rect = FULL, cam, base, bg, shadow, opacity = 1, children, overlay }) => {
  if (opacity <= 0.001 || rect.w < 1 || rect.h < 1) return null;
  return (
    <div
      style={{
        position: "absolute",
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: rect.r ?? 0,
        overflow: "hidden",
        backgroundColor: bg ?? "#FFFFFF",
        opacity,
        boxShadow: shadow ? "0 26px 60px rgba(20,40,90,0.22), 0 0 0 1px rgba(20,40,90,0.06)" : undefined,
        // своя группа композиции: скругление обрезает мир без артефактов
        isolation: "isolate",
      }}
    >
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${rect.w / 2 - cam.x * cam.s}px, ${rect.h / 2 - cam.y * cam.s}px) scale(${cam.s})`,
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

// Абсолютно позиционированный блок (px мира).
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
