// Камера: мир сцены рисуется в своих координатах (px); камера — точка
// мира в центре кадра и масштаб. Слой Depth при движении камеры смещается
// меньше — мягкий параллакс (вид из окна, дальняя стена).
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "./rig/motion";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };
export const WIDE: Cam = { x: 540, y: 960, zoom: 1 };

const CamContext = createContext<{ cam: Cam; base: Cam }>({ cam: WIDE, base: WIDE });

export const camMove = (f: number, from: number, to: number, a: Cam, b: Cam, ease = easeInOut): Cam => {
  const t = ease((f - from) / Math.max(1, to - from));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) };
};

// Камера по ключам [[кадр, Cam], …] с плавными переходами.
export const camKeys = (f: number, pts: readonly (readonly [number, Cam])[]): Cam => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, c1] = pts[i];
    const [t0, c0] = pts[i - 1];
    if (f <= t1) return camMove(f, t0, t1, c0, c1);
  }
  return pts[pts.length - 1][1];
};

export const Shot: React.FC<{
  readonly cam: Cam;
  readonly base?: Cam;
  readonly children: React.ReactNode;
  readonly bg?: string;
}> = ({ cam, base, children, bg }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
    <CamContext.Provider value={{ cam, base: base ?? WIDE }}>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 1,
          height: 1,
          transformOrigin: "0 0",
          transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
        }}
      >
        {children}
      </div>
    </CamContext.Provider>
  </div>
);

// Слой глубины: depth 1 — вместе с миром, 0 — неподвижен относительно кадра.
export const Depth: React.FC<{ readonly depth: number; readonly children: React.ReactNode }> = ({ depth, children }) => {
  const { cam, base } = useContext(CamContext);
  const dx = (cam.x - base.x) * (1 - depth);
  const dy = (cam.y - base.y) * (1 - depth) * 0.6;
  return <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${dx}px, ${dy}px)` }}>{children}</div>;
};

export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
