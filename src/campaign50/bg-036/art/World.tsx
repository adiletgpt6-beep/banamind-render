// Камера над столом (вид сверху). Мир сцены рисуется в своих координатах
// (px, по умолчанию совпадают с кадром 1080×1920 при zoom = 1); камера —
// точка мира в центре кадра и масштаб. Плавные движения — keys()/tween().
import type React from "react";
import { easeInOut, lerp } from "./motion";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number; readonly rot?: number };

export const CAM0: Cam = { x: 540, y: 960, zoom: 1 };

export const camMix = (a: Cam, b: Cam, t: number): Cam => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  zoom: a.zoom * Math.pow(b.zoom / a.zoom, t), // масштаб — по экспоненте, без «рывка»
  rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
});

// Камера по ключам [[кадр, Cam], …] с плавным входом/выходом.
export const camKeys = (f: number, pts: readonly (readonly [number, Cam])[], ease = easeInOut): Cam => {
  if (f <= pts[0][0]) return pts[0][1];
  for (let i = 1; i < pts.length; i++) {
    const [t1, c1] = pts[i];
    const [t0, c0] = pts[i - 1];
    if (f <= t1) return t1 <= t0 ? c1 : camMix(c0, c1, ease((f - t0) / (t1 - t0)));
  }
  return pts[pts.length - 1][1];
};

export const World: React.FC<{ readonly cam: Cam; readonly children: React.ReactNode }> = ({ cam, children }) => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: 1,
        height: 1,
        transformOrigin: "0 0",
        transform: `translate(540px, 960px) rotate(${cam.rot ?? 0}deg) scale(${cam.zoom}) translate(${-cam.x}px, ${-cam.y}px)`,
      }}
    >
      {children}
    </div>
  </div>
);

// Абсолютно позиционированный блок (px мира).
export const box = (s: React.CSSProperties): React.CSSProperties => ({ position: "absolute", ...s });
