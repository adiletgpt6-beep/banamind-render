// Камера сцены: мир 1080×1920 (или больше), точка мира (x, y) в центре
// кадра, увеличение zoom, наклон rot (градусы). Все движения — плавные
// функции от кадра, без скачков масштаба.
import React from "react";
import { AbsoluteFill } from "remotion";
import { H, W } from "./theme";

export type Cam = { readonly x: number; readonly y: number; readonly zoom: number; readonly rot?: number };
export const CAM_FULL: Cam = { x: W / 2, y: H / 2, zoom: 1 };

export const camTransform = (c: Cam) => `translate(${W / 2}px, ${H / 2}px) rotate(${c.rot ?? 0}deg) scale(${c.zoom}) translate(${-c.x}px, ${-c.y}px)`;

export const Camera: React.FC<{ readonly cam: Cam; readonly children: React.ReactNode; readonly width?: number; readonly height?: number }> = ({
  cam,
  children,
  width = W,
  height = H,
}) => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <div style={{ position: "absolute", left: 0, top: 0, width, height, transformOrigin: "0 0", transform: camTransform(cam) }}>{children}</div>
  </AbsoluteFill>
);

/** Точка мира → точка кадра для камеры cam. */
export const toScreen = (c: Cam, x: number, y: number) => ({ x: W / 2 + (x - c.x) * c.zoom, y: H / 2 + (y - c.y) * c.zoom });

/** Камера, при которой прямоугольник мира (x, y, w, h) вписан в кадр с полями pad. */
export const fitRect = (x: number, y: number, w: number, h: number, pad = 0): Cam => ({
  x: x + w / 2,
  y: y + h / 2,
  zoom: Math.min((W - pad * 2) / w, (H - pad * 2) / h),
});

export const mixCam = (a: Cam, b: Cam, t: number): Cam => {
  // масштаб интерполируется логарифмически — наезд воспринимается равномерным
  const z = Math.exp(Math.log(a.zoom) + (Math.log(b.zoom) - Math.log(a.zoom)) * t);
  // центр — так, чтобы точка-цель двигалась согласованно с масштабом
  const k = a.zoom === b.zoom ? t : (1 / a.zoom - 1 / z) / (1 / a.zoom - 1 / b.zoom);
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, zoom: z, rot: (a.rot ?? 0) + ((b.rot ?? 0) - (a.rot ?? 0)) * t };
};
