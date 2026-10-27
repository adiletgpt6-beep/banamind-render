// Общие помощники сцен BG-025: камера и планы, SVG-слой мира, бумажный
// фон, упругая остановка надписей, заголовок шага.
import { createContext, useContext } from "react";
import { clamp, easeInOut, easeOut, lerp } from "./rig/motion";
import { C, F, SAFE } from "./theme";

export const FPS = 30;
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });

// Появление 0 → 1 за d кадров, начиная с кадра at.
export const appear = (f: number, at: number, d = 12) => easeOut((f - at) / d);
// Плавный отрезок 0 → 1 между кадрами a и b.
export const span = (f: number, a: number, b: number) => easeInOut((f - a) / Math.max(1, b - a));

// ---------- Камера ----------
export type Cam = { readonly x: number; readonly y: number; readonly zoom: number; readonly rot?: number };
export const camMove = (f: number, a: number, b: number, c0: Cam, c1: Cam, ease = easeInOut): Cam => {
  const t = ease((f - a) / Math.max(1, b - a));
  return { x: lerp(c0.x, c1.x, t), y: lerp(c0.y, c1.y, t), zoom: lerp(c0.zoom, c1.zoom, t), rot: lerp(c0.rot ?? 0, c1.rot ?? 0, t) };
};
// Камера по ключам [кадр, камера]; между ключами — плавно.
export const camKeys = (f: number, keys: readonly (readonly [number, Cam])[]): Cam => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (f <= keys[i][0]) return camMove(f, keys[i - 1][0], keys[i][0], keys[i - 1][1], keys[i][1]);
  }
  return keys[keys.length - 1][1];
};

const CamCtx = createContext<Cam>({ x: 540, y: 960, zoom: 1 });
export const useCam = () => useContext(CamCtx);

// План: мир сцены в своих координатах (px), камера — точка мира в центре
// кадра 1080×1920 и масштаб. overlay рисуется поверх в координатах кадра.
export const Shot: React.FC<{
  readonly f: number;
  readonly from?: number;
  readonly to?: number;
  readonly cam: Cam;
  readonly bg?: string;
  readonly opacity?: number;
  readonly children: React.ReactNode;
  readonly overlay?: React.ReactNode;
}> = ({ f, from = -1e9, to = 1e9, cam, bg = C.bg, opacity = 1, children, overlay }) => {
  if (f < from || f >= to) return null;
  return (
    <div style={box({ inset: 0, overflow: "hidden", backgroundColor: bg, opacity })}>
      <CamCtx.Provider value={cam}>
        <div
          style={box({
            left: 0,
            top: 0,
            width: 1,
            height: 1,
            transformOrigin: "0 0",
            transform: `translate(540px, 960px) rotate(${cam.rot ?? 0}deg) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
          })}
        >
          {children}
        </div>
      </CamCtx.Provider>
      {overlay}
    </div>
  );
};

// SVG-слой в координатах мира (или кадра).
export const Svg: React.FC<{ readonly children: React.ReactNode; readonly opacity?: number }> = ({ children, opacity = 1 }) => (
  <svg width={1} height={1} style={box({ left: 0, top: 0, overflow: "visible", opacity })}>
    {children}
  </svg>
);

// ---------- Фон: светлая бумага с редкой точечной сеткой ----------
export const Paper: React.FC<{ readonly color?: string; readonly dots?: string; readonly step?: number; readonly x?: number; readonly y?: number; readonly w?: number; readonly h?: number }> = ({
  color = C.bg,
  dots = "rgba(20,40,90,0.08)",
  step = 54,
  x = -1200,
  y = -1200,
  w = 3600,
  h = 4400,
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
    })}
  />
);

// Упругая остановка: подготовка → действие → короткий перелёт ≈ 4 %.
export const settle = (t: number, dur = 14) => {
  const u = clamp(t / dur);
  return u >= 1 ? 1 : easeOut(u) + 0.06 * Math.sin(Math.PI * clamp((u - 0.55) / 0.45)) * (1 - u);
};

// ---------- Заголовок шага (в координатах кадра) ----------
// Жёлтый номер в круге + тёмно-синяя строка на белой плашке. Входит
// упруго сверху и неподвижен; out 0…1 — уход.
export const StepHead: React.FC<{
  readonly n: number | null;
  readonly text: string;
  readonly t: number; // кадры от входа
  readonly out?: number;
  readonly top?: number;
  readonly size?: number;
}> = ({ n, text, t, out = 0, top = SAFE.top + 10, size = 50 }) => {
  const k = settle(t, 16);
  if (t < 0) return null;
  return (
    <div
      style={box({
        left: SAFE.left,
        right: SAFE.right - 40,
        top,
        display: "flex",
        justifyContent: "center",
        opacity: clamp(k * 1.4) * (1 - out),
        transform: `translateY(${(1 - k) * -40 - out * 30}px)`,
      })}
    >
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 18,
          padding: n === null ? "18px 34px" : "14px 34px 14px 16px",
          borderRadius: 999,
          backgroundColor: C.white,
          boxShadow: "0 14px 34px rgba(20,40,90,0.16)",
          fontFamily: F.text,
          fontWeight: 900,
          fontSize: size,
          lineHeight: 1.08,
          color: C.navy,
          maxWidth: 880,
        }}
      >
        {n !== null ? (
          <div
            style={{
              width: size * 1.55,
              height: size * 1.55,
              borderRadius: 999,
              backgroundColor: C.yellow,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontSize: size * 0.9,
            }}
          >
            {n}
          </div>
        ) : null}
        <span>{text.replace(/^\d\.\s*/, "")}</span>
      </div>
    </div>
  );
};

// Небольшая плашка-подпись (в координатах того слоя, где лежит).
export const Chip: React.FC<{
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly t: number;
  readonly bg?: string;
  readonly color?: string;
  readonly size?: number;
  readonly out?: number;
  readonly anchor?: "left" | "center" | "right";
  readonly icon?: React.ReactNode;
  readonly border?: string;
}> = ({ text, x, y, t, bg = C.navy, color = C.white, size = 36, out = 0, anchor = "center", icon, border }) => {
  const k = settle(t, 14);
  if (t < 0) return null;
  const tx = anchor === "center" ? "-50%" : anchor === "right" ? "-100%" : "0%";
  return (
    <div
      style={box({
        left: x,
        top: y,
        transform: `translate(${tx}, -50%) scale(${0.85 + 0.15 * k})`,
        transformOrigin: anchor === "left" ? "0% 50%" : anchor === "right" ? "100% 50%" : "50% 50%",
        opacity: clamp(k * 1.5) * (1 - out),
        display: "inline-flex",
        alignItems: "center",
        gap: 12,
        padding: `${size * 0.32}px ${size * 0.7}px`,
        borderRadius: 999,
        backgroundColor: bg,
        border: border ? `4px solid ${border}` : undefined,
        color,
        fontFamily: F.text,
        fontWeight: 900,
        fontSize: size,
        lineHeight: 1.1,
        whiteSpace: "nowrap",
        boxShadow: "0 10px 24px rgba(20,40,90,0.14)",
      })}
    >
      {icon}
      {text}
    </div>
  );
};

// Постоянная пометка «Шарттуу мисал» в углу кадра (координаты кадра).
export const ExampleBadge: React.FC<{ readonly text: string; readonly t: number; readonly out?: number; readonly top?: number }> = ({ text, t, out = 0, top = SAFE.top + 128 }) => (
  <div
    style={box({
      left: SAFE.left,
      top,
      opacity: clamp(t / 10) * (1 - out),
      padding: "8px 22px",
      borderRadius: 14,
      backgroundColor: "rgba(255,255,255,0.96)",
      border: `4px dashed ${C.navy}`,
      color: C.navy,
      fontFamily: F.text,
      fontWeight: 900,
      fontSize: 34,
      boxShadow: "0 6px 14px rgba(20,40,90,0.12)",
    })}
  >
    {text}
  </div>
);
