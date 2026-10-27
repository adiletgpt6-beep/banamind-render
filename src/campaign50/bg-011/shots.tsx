// Планы и камера. Мир сцены рисуется в своих координатах (px); камера —
// точка мира в центре окна и масштаб. Окно — весь кадр (Shot) или полоса
// split-screen (Panel). Стоп-кадр делается сценой: она передаёт миру
// замороженный номер кадра, а Freeze добавляет вспышку, «фото»-обработку
// и подписи.
import { createContext, useContext } from "react";
import { easeInOut, easeOut, lerp } from "./rig/motion";

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

// Камера по ключам [кадр, положение] — плавные переходы между ключами.
export const camKeys = (f: number, pts: readonly (readonly [number, Cam])[], ease = easeInOut): Cam => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, c1] = pts[i];
    const [t0, c0] = pts[i - 1];
    if (f <= t1) {
      const u = ease((f - t0) / Math.max(1, t1 - t0));
      return { x: lerp(c0.x, c1.x, u), y: lerp(c0.y, c1.y, u), zoom: lerp(c0.zoom, c1.zoom, u) };
    }
  }
  return pts[pts.length - 1][1];
};

// Окно камеры: прямоугольник кадра (px), в котором показан мир.
export const View: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly w?: number;
  readonly h?: number;
  readonly cam: Cam;
  readonly base?: Cam;
  readonly bg?: string;
  readonly filter?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ x = 0, y = 0, w = 1080, h = 1920, cam, base, bg, filter, children, overlay }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, overflow: "hidden", backgroundColor: bg ?? "#FFFFFF" }}>
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
          filter,
        }}
      >
        {children}
      </div>
    </CamContext.Provider>
    {overlay}
  </div>
);

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
  readonly filter?: string;
}> = ({ f, from, to, children, ...rest }) => {
  if (f < from || f >= to) return null;
  return <View {...rest}>{children}</View>;
};

// Слой глубины: depth 1 — вместе с миром, 0 — неподвижен относительно окна.
export const Depth: React.FC<{ readonly depth: number; readonly children: React.ReactNode }> = ({ depth, children }) => {
  const { cam, base } = useContext(CamContext);
  const dx = (cam.x - base.x) * (1 - depth);
  const dy = (cam.y - base.y) * (1 - depth) * 0.6;
  return <div style={{ position: "absolute", left: 0, top: 0, transform: `translate(${dx}px, ${dy}px)` }}>{children}</div>;
};

// Абсолютно позиционированный блок (px мира).
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Стоп-кадр комедии положений: кадр мира останавливается (сцена передаёт
// миру номер кадра freezeAt), короткая белая вспышка, лёгкий «наезд»,
// тёплая фото-обработка и рамка. f — кадр сцены, at — начало стоп-кадра.
export const freezeFrame = (f: number, at: number, until = Infinity) => (f >= at && f < until ? at : f);

export const FreezeLook: React.FC<{
  readonly f: number;
  readonly at: number;
  readonly until?: number;
  readonly children: React.ReactNode;
}> = ({ f, at, until = Infinity, children }) => {
  const on = f >= at && f < until;
  const u = on ? easeOut((f - at) / 8) : 0;
  const out = Number.isFinite(until) ? easeOut((f - until) / 6) : 0;
  const k = on ? lerp(1, 1.035, u) : 1;
  const flash = on ? Math.max(0, 1 - (f - at) / 5) : 0;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `scale(${k})`,
          transformOrigin: "50% 50%",
          filter: on ? `saturate(${lerp(1, 0.72, u)}) sepia(${0.18 * u}) contrast(${lerp(1, 1.06, u)})` : undefined,
        }}
      >
        {children}
      </div>
      {on ? (
        <>
          <div style={{ position: "absolute", inset: 0, boxShadow: `inset 0 0 0 ${18 * u}px #FFFFFF, inset 0 0 160px rgba(40,30,20,${0.28 * u})` }} />
          <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: flash * 0.85 }} />
        </>
      ) : out > 0 && out < 1 ? (
        <div style={{ position: "absolute", inset: 0, backgroundColor: "#FFFFFF", opacity: (1 - out) * 0.4 }} />
      ) : null}
    </div>
  );
};
