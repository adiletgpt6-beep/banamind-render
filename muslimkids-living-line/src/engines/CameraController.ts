// CameraController — a virtual 2D camera over the world.
//
// The camera is described by keyframes (frame, centre, zoom, rotation).
// Between keys the centre is eased, zoom is interpolated in log space
// (so a 1× → 8× push feels uniform) and rotation lets the camera "lie down"
// along a curved planet surface. An optional `follow` weight pulls the
// centre towards a smoothed position of the line tip, so the camera
// travels WITH the line instead of jumping between shots.

import { Easing } from "remotion";
import { clamp, lerp, rotate, type Vec } from "../utils/geometry.ts";

export type EaseFn = (t: number) => number;

export type CamKey = {
  f: number;
  x: number;
  y: number;
  zoom: number;
  rot?: number; // radians, positive = world turns clockwise on screen
  follow?: number; // 0..1 weight towards the smoothed line tip
  ease?: EaseFn; // easing used to ARRIVE at this key
};

export type Camera = { x: number; y: number; zoom: number; rot: number; follow: number };

export const SCREEN = { w: 1080, h: 1920 };

export const cinematic: EaseFn = Easing.bezier(0.45, 0.02, 0.2, 1);

export const cameraAt = (keys: CamKey[], f: number): Camera => {
  if (f <= keys[0].f) return toCam(keys[0]);
  const last = keys[keys.length - 1];
  if (f >= last.f) return toCam(last);
  let i = 0;
  while (keys[i + 1].f < f) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = (b.ease ?? cinematic)(clamp((f - a.f) / (b.f - a.f)));
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    zoom: Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), t)),
    rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
    follow: lerp(a.follow ?? 0, b.follow ?? 0, t),
  };
};

const toCam = (k: CamKey): Camera => ({
  x: k.x,
  y: k.y,
  zoom: k.zoom,
  rot: k.rot ?? 0,
  follow: k.follow ?? 0,
});

/**
 * Final camera: keyed camera blended towards the (smoothed) tip.
 * `tipAt` must be a pure function of the frame (deterministic render).
 */
export const resolveCamera = (keys: CamKey[], f: number, tipAt: (f: number) => Vec): Camera => {
  const cam = cameraAt(keys, f);
  if (cam.follow <= 0.001) return cam;
  // Smooth the tip over the last ~10 frames — removes the jitter of the
  // drawing hand while keeping the camera deterministic.
  let sx = 0;
  let sy = 0;
  let sw = 0;
  for (let k = 0; k <= 10; k += 2) {
    const w = 1 - k / 12;
    const p = tipAt(f - k);
    sx += p.x * w;
    sy += p.y * w;
    sw += w;
  }
  return { ...cam, x: lerp(cam.x, sx / sw, cam.follow), y: lerp(cam.y, sy / sw, cam.follow) };
};

/** SVG transform that maps world → screen for this camera. */
export const cameraTransform = (c: Camera): string =>
  `translate(${SCREEN.w / 2} ${SCREEN.h / 2}) rotate(${(c.rot * 180) / Math.PI}) scale(${c.zoom}) translate(${-c.x} ${-c.y})`;

export const worldToScreen = (c: Camera, p: Vec): Vec => {
  const r = rotate({ x: (p.x - c.x) * c.zoom, y: (p.y - c.y) * c.zoom }, c.rot);
  return { x: r.x + SCREEN.w / 2, y: r.y + SCREEN.h / 2 };
};

export const screenToWorld = (c: Camera, p: Vec): Vec => {
  const r = rotate({ x: p.x - SCREEN.w / 2, y: p.y - SCREEN.h / 2 }, -c.rot);
  return { x: r.x / c.zoom + c.x, y: r.y / c.zoom + c.y };
};
