// Планы и камера. Мир сцены рисуется в своих координатах (px); камера —
// точка мира в центре окна кадра и масштаб. Окно — весь кадр 1080×1920
// или его часть (сплит: графика сверху, персонаж снизу — приём референса).
// Дальние слои (Depth) при движении камеры смещаются меньше.
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

// Окно кадра (px кадра): по умолчанию весь кадр.
export type View = { readonly top: number; readonly height: number };
export const FULL: View = { top: 0, height: 1920 };

export const Shot: React.FC<{
  readonly f: number;
  readonly from: number;
  readonly to: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
  readonly bg?: string;
  readonly view?: View;
  readonly opacity?: number;
}> = ({ f, from, to, cam, base, children, overlay, bg, view = FULL, opacity = 1 }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: view.top, width: 1080, height: view.height, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF", opacity }}>
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${540 - cam.x * cam.zoom}px, ${view.height / 2 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
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

// Плавная смена планов внутри сцены: возвращает прозрачность плана, который
// начинается в кадре at (короткий наплыв n кадров; 0 — обычная склейка).
export const xfade = (f: number, at: number, n: number) => (n <= 0 ? (f >= at ? 1 : 0) : Math.max(0, Math.min(1, (f - at) / n)));
