// Общие помощники сцен: время сцены и реплик, камера и планы, бумажный фон
// с точечной сеткой, тяжёлая типографика.
import { createContext, useContext, useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useTimeline } from "./context";
import { sceneTools } from "./plan";
import type { Ch2Timeline } from "./timing";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { CH2_VIDEO, type Ch2SceneId } from "./script";
import { C, F } from "./theme";

export const FPS = CH2_VIDEO.fps;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Кадр сцены и инструменты времени (plan.ts) текущей сцены.
export const useScene = (id: Ch2SceneId) => {
  const f = useCurrentFrame();
  const tl = useTimeline();
  return { f, tl, ...sceneTools(tl, id) };
};

// План сцены: чистая функция от шкалы (кадры действий), одна и та же для
// анимации и звука.
export const usePlan = <T,>(fn: (tl: Ch2Timeline) => T): T => {
  const tl = useTimeline();
  return useMemo(() => fn(tl), [fn, tl]);
};

// ---------- Камера ----------
export type Cam = { readonly x: number; readonly y: number; readonly zoom: number };
export const camMove = (f: number, a: number, b: number, c0: Cam, c1: Cam, ease = easeInOut): Cam => {
  const t = ease((f - a) / Math.max(1, b - a));
  return { x: lerp(c0.x, c1.x, t), y: lerp(c0.y, c1.y, t), zoom: lerp(c0.zoom, c1.zoom, t) };
};

const CamCtx = createContext<Cam>({ x: 540, y: 960, zoom: 1 });
export const useCam = () => useContext(CamCtx);

// План: мир сцены в своих координатах (px), камера — точка мира в центре
// кадра 1080×1920 и масштаб. Рисуется только в кадрах [from, to).
export const Shot: React.FC<{
  readonly f: number;
  readonly from?: number;
  readonly to?: number;
  readonly cam: Cam;
  readonly bg?: string;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ f, from = -1e9, to = 1e9, cam, bg = C.paper, children, overlay }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: bg })}>
      <CamCtx.Provider value={cam}>
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(${540 - cam.x * cam.zoom}px, ${960 - cam.y * cam.zoom}px) scale(${cam.zoom})`,
          })}
        >
          {children}
        </div>
      </CamCtx.Provider>
      {overlay}
    </div>
  );
};

// SVG-слой в координатах мира.
export const Svg: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity })}>
    {children}
  </svg>
);

// ---------- Бумажный фон с редкой точечной сеткой ----------
export const Paper: React.FC<{ readonly color?: string; readonly dots?: string; readonly step?: number; readonly x?: number; readonly y?: number; readonly w?: number; readonly h?: number }> = ({
  color = C.paper,
  dots = "rgba(17,17,17,0.13)",
  step = 54,
  x = -600,
  y = -600,
  w = 2400,
  h = 3200,
}) => (
  <div
    style={box({
      left: x,
      top: y,
      width: w,
      height: h,
      backgroundColor: color,
      backgroundImage: `radial-gradient(circle, ${dots} 2.6px, transparent 3px)`,
      backgroundSize: `${step}px ${step}px`,
      backgroundPosition: `${step / 2}px ${step / 2}px`,
    })}
  />
);

// ---------- Типографика ----------
// Тяжёлая строка: входит со смещением (подготовка → действие → короткая
// упругая остановка) и остаётся неподвижной. t — кадры от начала входа.
export const settle = (t: number, dur = 14) => {
  const u = clamp(t / dur);
  // небольшой перелёт ≈ 4 % и возврат
  return u >= 1 ? 1 : easeOut(u) + 0.06 * Math.sin(Math.PI * clamp((u - 0.55) / 0.45)) * (1 - u);
};

export const HeavyLine: React.FC<{
  readonly text: string;
  readonly t: number; // кадры от начала входа строки
  readonly size: number;
  readonly color?: string;
  readonly from?: "left" | "right" | "up" | "down";
  readonly dist?: number;
  readonly align?: "left" | "center" | "right";
  readonly style?: React.CSSProperties;
}> = ({ text, t, size, color = C.ink, from = "left", dist = 260, align = "left", style }) => {
  if (t < 0) return null;
  const k = settle(t);
  const off = (1 - k) * dist;
  const tr = from === "left" ? `translateX(${-off}px)` : from === "right" ? `translateX(${off}px)` : from === "up" ? `translateY(${-off}px)` : `translateY(${off}px)`;
  return (
    <div
      style={{
        fontFamily: F.display,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 0.98,
        letterSpacing: -size * 0.02,
        color,
        transform: tr,
        opacity: clamp(t / 4),
        textAlign: align,
        whiteSpace: "nowrap",
        ...style,
      }}
    >
      {text}
    </div>
  );
};

// Подпись в кадре (короткая, читаемая): плашка с тяжёлым текстом.
export const Tag: React.FC<{ readonly text: string; readonly t: number; readonly x: number; readonly y: number; readonly bg?: string; readonly color?: string; readonly size?: number; readonly out?: number }> = ({
  text,
  t,
  x,
  y,
  bg = C.ink,
  color = C.paper,
  size = 58,
  out = 1e9,
}) => {
  if (t < 0) return null;
  const k = settle(t, 12);
  const o = 1 - clamp((t - out) / 8);
  if (o <= 0) return null;
  return (
    <div style={box({ left: x, top: y, transform: `translateX(${(1 - k) * -120}px)`, opacity: clamp(t / 4) * o })}>
      <div style={{ backgroundColor: bg, color, fontFamily: F.display, fontWeight: 900, fontSize: size, padding: `${size * 0.18}px ${size * 0.36}px ${size * 0.22}px`, whiteSpace: "nowrap", lineHeight: 1 }}>{text}</div>
    </div>
  );
};

// Подпись времени («Бир нече күн мурун»): спокойная плашка в верхней
// безопасной зоне, мягкое появление и исчезновение, без прыжков.
export const TimeCaption: React.FC<{ readonly text: string; readonly t: number; readonly dur: number; readonly top?: number }> = ({ text, t, dur, top = 210 }) => {
  if (t < 0 || t > dur) return null;
  const o = clamp(t / 8) * (1 - clamp((t - dur + 10) / 10));
  return (
    <div style={box({ left: 0, top, width: 1080, display: "flex", justifyContent: "center", opacity: o })}>
      <div style={{ backgroundColor: "rgba(247,244,238,0.94)", color: C.ink, fontFamily: F.text, fontWeight: 800, fontSize: 52, padding: "14px 34px 18px", borderRadius: 14, transform: `translateY(${(1 - easeOut(clamp(t / 10))) * -10}px)` }}>{text}</div>
    </div>
  );
};
