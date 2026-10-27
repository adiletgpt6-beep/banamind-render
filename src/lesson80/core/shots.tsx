// Планы и камера. Мир сцены рисуется в своих координатах (px); камера —
// точка мира в центре кадра и масштаб. Дальние слои (Depth) при движении
// камеры смещаются меньше — глубина пространства.
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "../rig/motion";
import { L80_VIDEO } from "./video";

const CX = L80_VIDEO.width / 2;
const CY = L80_VIDEO.height / 2;

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

const CamContext = createContext<{ cam: Cam; base: Cam }>({
  cam: { x: CX, y: CY, zoom: 1 },
  base: { x: CX, y: CY, zoom: 1 },
});

// Спокойное движение камеры между двумя положениями (плавный вход и выход).
export const camMove = (f: number, from: number, to: number, a: Cam, b: Cam, ease = easeInOut): Cam => {
  const t = ease((f - from) / Math.max(1, to - from));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) };
};

// Камера с едва заметным «дыханием» — живой статичный план без тряски.
export const camHold = (f: number, c: Cam, amp = 0.004): Cam => ({
  x: c.x + Math.sin(f / 97) * amp * 400,
  y: c.y + Math.cos(f / 131) * amp * 260,
  zoom: c.zoom * (1 + Math.sin(f / 151) * amp),
});

export const Shot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly bg?: string;
}> = ({ f, from, to, cam, base, children, overlay, bg }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${CX - cam.x * cam.zoom}px, ${CY - cam.y * cam.zoom}px) scale(${cam.zoom})`,
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
