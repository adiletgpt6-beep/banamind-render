// Объёмная бумажная карта: настоящая перспектива CSS 3D. Лист карты лежит
// на столе (наклон камеры tilt), бумажные фигурки «раскладываются» из
// листа, как в pop-up книге (Standee: up 0 → 1). Камера: точка листа
// (cx, cy) в экранной точке (540, sy), масштаб zoom.
//
// project() повторяет ту же математику для 2D-слоёв поверх сцены (руки,
// подписи), чтобы они точно попадали в точки карты.
import { C } from "./palette";

export type Cam = {
  readonly cx: number;
  readonly cy: number;
  readonly zoom: number;
  readonly tilt: number; // градусы: 0 — сверху, 60 — сильно наклонён
  readonly sy: number; // экранная высота центра камеры
};

export const PERSP = 2100;
const rad = (d: number) => (d * Math.PI) / 180;

export const lerpCam = (a: Cam, b: Cam, t: number): Cam => ({
  cx: a.cx + (b.cx - a.cx) * t,
  cy: a.cy + (b.cy - a.cy) * t,
  zoom: a.zoom * Math.pow(b.zoom / a.zoom, t),
  tilt: a.tilt + (b.tilt - a.tilt) * t,
  sy: a.sy + (b.sy - a.sy) * t,
});

// Экранная точка для точки листа (x, y) на высоте h над листом.
export const project = (cam: Cam, x: number, y: number, h = 0) => {
  const t = rad(cam.tilt);
  const X = (x - cam.cx) * cam.zoom;
  const Y = ((y - cam.cy) * Math.cos(t) - h * Math.sin(t)) * cam.zoom;
  const Z = ((y - cam.cy) * Math.sin(t) + h * Math.cos(t)) * cam.zoom;
  const s = PERSP / (PERSP - Z);
  return { x: 540 + X * s, y: cam.sy + Y * s, s: s * cam.zoom };
};

// Экранная точка для точки «фигурки-открытки» (billboard), стоящей в (x, y):
// вертикальное смещение h в фигурке — строго вверх по экрану.
export const projectBillboard = (cam: Cam, x: number, y: number, h = 0) => {
  const base = project(cam, x, y, 0);
  return { x: base.x, y: base.y - h * base.s, s: base.s };
};

export const Stage: React.FC<{
  readonly cam: Cam;
  readonly children: React.ReactNode;
  readonly background?: string;
  readonly backdrop?: React.ReactNode; // 2D-слой за листом (горы на горизонте)
}> = ({ cam, children, background, backdrop }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      overflow: "hidden",
      background: background ?? `linear-gradient(180deg, #F4F8FD 0%, ${C.sky} 30%, #DCE6F2 60%, #CBD7E8 100%)`,
      perspective: `${PERSP}px`,
      perspectiveOrigin: `540px ${cam.sy}px`,
    }}
  >
    {backdrop}
    <div
      style={{
        position: "absolute",
        left: 540,
        top: cam.sy,
        width: 0,
        height: 0,
        transformStyle: "preserve-3d",
        transformOrigin: "0 0",
        transform: `scale3d(${cam.zoom}, ${cam.zoom}, ${cam.zoom}) rotateX(${cam.tilt}deg) translate3d(${-cam.cx}px, ${-cam.cy}px, 0px)`,
      }}
    >
      {children}
    </div>
  </div>
);

// Плоский элемент на листе (наклейка, линия, тень) — в координатах листа.
export const Flat: React.FC<{
  readonly x?: number;
  readonly y?: number;
  readonly z?: number; // микроподъём над бумагой, чтобы не мерцать
  readonly children: React.ReactNode;
  readonly style?: React.CSSProperties;
}> = ({ x = 0, y = 0, z = 0.5, children, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transform: `translateZ(${z}px)`, ...style }}>{children}</div>
);

// Бумажная фигурка, которая раскладывается из листа: при up = 0 лежит
// плашмя (верх к дальнему краю), при up = 1 стоит под углом angle к листу.
// billboard — угол равен наклону камеры: фигурка смотрит прямо в кадр.
export const Standee: React.FC<{
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
  readonly up?: number;
  readonly angle?: number;
  readonly lift?: number; // подъём над листом внутри фигурки (прыжок)
  readonly sx?: number; // масштаб по ширине (сплющивание, разворот)
  readonly sy?: number; // масштаб по высоте
  readonly rot?: number; // наклон фигурки в её плоскости, градусы
  readonly opacity?: number;
  readonly shadow?: number; // радиус тени на листе (0 — без тени)
  readonly children: React.ReactNode;
}> = ({ x, y, w, h, up = 1, angle = 90, lift = 0, sx = 1, sy = 1, rot = 0, opacity = 1, shadow = 0, children }) => {
  if (opacity <= 0.001) return null;
  const a = angle * up;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 0, height: 0, transformStyle: "preserve-3d" }}>
      {shadow > 0 ? (
        <div
          style={{
            position: "absolute",
            left: -shadow,
            top: -shadow * 0.32,
            width: shadow * 2,
            height: shadow * 0.64,
            borderRadius: "50%",
            background: "radial-gradient(closest-side, rgba(20,40,90,0.30), rgba(20,40,90,0))",
            opacity: opacity * Math.min(1, up * 1.4) * Math.max(0.35, 1 - lift / 260),
            transform: `translateZ(0.6px) scale(${1 - Math.min(0.45, lift / 400)})`,
          }}
        />
      ) : null}
      <div
        style={{
          position: "absolute",
          left: -w / 2,
          top: -h,
          width: w,
          height: h,
          transformOrigin: "50% 100%",
          transform: `translateZ(1px) rotateX(${-a}deg) translateY(${-lift}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
          opacity,
        }}
      >
        {children}
      </div>
    </div>
  );
};
