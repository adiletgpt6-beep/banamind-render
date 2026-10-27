// Планы и камера. Мир сцены рисуется в своих координатах (px); камера —
// точка мира в центре кадра и масштаб. Дальние слои (Depth) при движении
// камеры смещаются меньше — глубина пространства.
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "./rig/motion";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

const CamContext = createContext<{ cam: Cam; base: Cam }>({
  cam: { x: 540, y: 960, zoom: 1 },
  base: { x: 540, y: 960, zoom: 1 },
});

// Спокойное движение камеры между двумя положениями.
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
            transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
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

// План внутри панели (x, y, w, h — кадр 1080×1920): мир рисуется своей
// камерой, центр камеры — в центре панели; края скруглены, тонкая рамка.
export const PanelShot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly cam: Cam;
  readonly children: React.ReactNode;
  readonly bg?: string;
  readonly opacity?: number;
  readonly radius?: number;
  readonly border?: string;
  readonly base?: Cam; // положение камеры, от которого считается параллакс слоёв Depth
}> = ({ f, from, to, x, y, w, h, cam, children, bg, opacity = 1, radius = 28, border = "2px solid #45647D", base }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", borderRadius: radius, backgroundColor: bg ?? "#102239", border, opacity }}>
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${w / 2 - cam.x * cam.zoom}px, ${h / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          }}
        >
          {children}
        </div>
      </CamContext.Provider>
    </div>
  );
};
