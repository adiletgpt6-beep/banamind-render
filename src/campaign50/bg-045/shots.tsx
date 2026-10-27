// Планы, камера и зеркальные панели. Мир сцены рисуется в своих
// координатах (px); камера — точка мира в центре окна и масштаб. Окно —
// весь кадр или его вертикальная половина (split-screen). Зеркальная
// панель отражает мир относительно вертикальной оси mirror (px мира):
// надписи внутри мира (экран ноутбука, календарь, часы) читаются нормально —
// они переворачиваются обратно через useMirrored (см. Unflip).
// Дальние слои (Depth) при движении камеры смещаются меньше — глубина.
import { createContext, useContext } from "react";
import { easeInOut, lerp } from "./rig/motion";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };

const CamContext = createContext<{ cam: Cam; base: Cam }>({
  cam: { x: 540, y: 960, zoom: 1 },
  base: { x: 540, y: 960, zoom: 1 },
});

// Мир отражён зеркально (правая половина): надписи нужно перевернуть обратно.
const MirrorContext = createContext(false);
export const useMirrored = () => useContext(MirrorContext);

// Спокойное движение камеры между двумя положениями.
export const camMove = (f: number, from: number, to: number, a: Cam, b: Cam, ease = easeInOut): Cam => {
  const t = ease((f - from) / Math.max(1, to - from));
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) };
};

export const mixCam = (a: Cam, b: Cam, t: number): Cam => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), zoom: lerp(a.zoom, b.zoom, t) });

// Окно в мир: left/width — область кадра (px), cam — точка мира в центре окна.
export const View: React.FC<{
  readonly left?: number;
  readonly width?: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly mirror?: number; // ось отражения (px мира) или undefined
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ left = 0, width = 1080, cam, base, mirror, bg, children, style }) => {
  const flip = mirror !== undefined ? ` translate(${mirror}px, 0px) scale(-1, 1) translate(${-mirror}px, 0px)` : "";
  return (
    <div style={{ position: "absolute", left, top: 0, width, height: 1920, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF", ...style }}>
      <CamContext.Provider value={{ cam, base: base ?? cam }}>
        <MirrorContext.Provider value={mirror !== undefined}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 1,
              height: 1,
              transformOrigin: "0 0",
              transform: `translate(${width / 2 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})${flip}`,
            }}
          >
            {children}
          </div>
        </MirrorContext.Provider>
      </CamContext.Provider>
    </div>
  );
};

// План на весь кадр, видимый в кадрах [from, to).
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
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <View cam={cam} base={base} bg={bg}>
        {children}
      </View>
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

// Блок с надписью внутри зеркального мира: переворачивается обратно вокруг
// своего центра, чтобы текст читался (как отражение экрана в «умном» зеркале).
export const Unflip: React.FC<{ readonly style: React.CSSProperties; readonly children?: React.ReactNode }> = ({ style, children }) => {
  const m = useMirrored();
  return <div style={{ position: "absolute", ...style, transform: `${style.transform ?? ""}${m ? " scaleX(-1)" : ""}` }}>{children}</div>;
};
