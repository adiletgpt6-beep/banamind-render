// LightingSystem — light, atmosphere and texture.
//
//  • <LightingDefs>  shared filters / gradients (line glow, tip halo…)
//  • <Sky>           environment gradient blended between keyframes
//  • <Starfield>     deterministic stars on three parallax depths
//  • <Glow>          soft radial light anchored in the world
//  • <Finish>        vignette + fine film grain (premium, not neon)

import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { SCREEN, type Camera } from "./CameraController.ts";
import { clamp, lerp, rand, rotate } from "../utils/geometry.ts";
import { PALETTE } from "../styles/palette.ts";

export type EnvKey = {
  f: number;
  top: string;
  bottom: string;
  stars: number; // 0..1
  warm: number; // 0..1 warm horizon glow
};

const hex = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
export const mixHex = (a: string, b: string, t: number): string => {
  const pa = hex(a);
  const pb = hex(b);
  return `rgb(${pa.map((x, i) => Math.round(lerp(x, pb[i], clamp(t)))).join(",")})`;
};
const toRgbHex = (rgb: string): string => {
  const m = rgb.match(/\d+/g)!.map(Number);
  return `#${m.map((x) => x.toString(16).padStart(2, "0")).join("")}`;
};

export const envAt = (keys: EnvKey[], f: number): EnvKey => {
  if (f <= keys[0].f) return keys[0];
  const last = keys[keys.length - 1];
  if (f >= last.f) return last;
  let i = 0;
  while (keys[i + 1].f < f) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t0 = (f - a.f) / (b.f - a.f);
  const t = t0 * t0 * (3 - 2 * t0);
  return {
    f,
    top: toRgbHex(mixHex(a.top, b.top, t)),
    bottom: toRgbHex(mixHex(a.bottom, b.bottom, t)),
    stars: lerp(a.stars, b.stars, t),
    warm: lerp(a.warm, b.warm, t),
  };
};

export const LightingDefs: React.FC = () => (
  <defs>
    <filter id="line-glow" x="0" y="0" width={SCREEN.w} height={SCREEN.h} filterUnits="userSpaceOnUse">
      <feGaussianBlur stdDeviation="9" />
    </filter>
    <filter id="soft-blur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="6" />
    </filter>
    <radialGradient id="tip-halo">
      <stop offset="0" stopColor="#FFF3D1" stopOpacity="0.95" />
      <stop offset="0.22" stopColor={PALETTE.gold} stopOpacity="0.55" />
      <stop offset="0.6" stopColor={PALETTE.gold} stopOpacity="0.12" />
      <stop offset="1" stopColor={PALETTE.gold} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="tip-halo-cool">
      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
      <stop offset="0.22" stopColor={PALETTE.blue} stopOpacity="0.5" />
      <stop offset="0.6" stopColor={PALETTE.blue} stopOpacity="0.1" />
      <stop offset="1" stopColor={PALETTE.blue} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="warm-light">
      <stop offset="0" stopColor="#FFE2A0" stopOpacity="0.9" />
      <stop offset="0.35" stopColor={PALETTE.gold} stopOpacity="0.35" />
      <stop offset="1" stopColor={PALETTE.gold} stopOpacity="0" />
    </radialGradient>
    <radialGradient id="cool-light">
      <stop offset="0" stopColor="#E8FBFF" stopOpacity="0.7" />
      <stop offset="0.4" stopColor={PALETTE.blue} stopOpacity="0.2" />
      <stop offset="1" stopColor={PALETTE.blue} stopOpacity="0" />
    </radialGradient>
  </defs>
);

export const Sky: React.FC<{ env: EnvKey }> = ({ env }) => (
  <svg width={SCREEN.w} height={SCREEN.h} style={{ position: "absolute" }}>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={env.top} />
        <stop offset="1" stopColor={env.bottom} />
      </linearGradient>
      <radialGradient id="sky-warm" cx="0.5" cy="1.05" r="0.75">
        <stop offset="0" stopColor="#F3B866" stopOpacity={0.42 * env.warm} />
        <stop offset="0.45" stopColor="#C9846A" stopOpacity={0.14 * env.warm} />
        <stop offset="1" stopColor="#C9846A" stopOpacity="0" />
      </radialGradient>
    </defs>
    <rect width={SCREEN.w} height={SCREEN.h} fill="url(#sky)" />
    <rect width={SCREEN.w} height={SCREEN.h} fill="url(#sky-warm)" />
  </svg>
);

const STARS = Array.from({ length: 150 }, (_, i) => ({
  x: rand(i * 3 + 1) * (SCREEN.w + 160),
  y: rand(i * 3 + 2) * (SCREEN.h + 160),
  depth: [0.05, 0.11, 0.2][i % 3],
  size: 0.8 + rand(i * 7 + 5) * (i % 3 === 2 ? 2.2 : 1.4),
  phase: rand(i * 11 + 3) * Math.PI * 2,
  warm: rand(i * 13 + 9) > 0.82,
}));

/** Parallax stars: far layers move less with the camera than near ones. */
export const Starfield: React.FC<{ f: number; cam: Camera; alpha: number }> = ({ f, cam, alpha }) => {
  if (alpha <= 0.01) return null;
  const W = SCREEN.w + 160;
  const H = SCREEN.h + 160;
  const s = Math.pow(cam.zoom, 0.1);
  return (
    <svg width={SCREEN.w} height={SCREEN.h} style={{ position: "absolute" }}>
      {STARS.map((st, i) => {
        const k = st.depth * 0.9;
        let x = st.x - cam.x * k;
        let y = st.y - cam.y * k;
        x = ((x % W) + W) % W - 80;
        y = ((y % H) + H) % H - 80;
        const r = rotate({ x: (x - SCREEN.w / 2) * s, y: (y - SCREEN.h / 2) * s }, cam.rot * 0.5);
        const tw = 0.55 + 0.45 * Math.sin(f / 18 + st.phase);
        return (
          <circle
            key={i}
            cx={r.x + SCREEN.w / 2}
            cy={r.y + SCREEN.h / 2}
            r={st.size}
            fill={st.warm ? "#FFE7B0" : "#DDEFFF"}
            opacity={alpha * tw * (0.35 + st.depth * 2.4)}
          />
        );
      })}
    </svg>
  );
};

/** Vignette + grain on top of everything. */
export const Finish: React.FC<{ grain?: number }> = ({ grain = 0.05 }) => (
  <>
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse 75% 60% at 50% 48%, rgba(0,0,0,0) 55%, rgba(4,8,16,0.55) 100%)",
      }}
    />
    <AbsoluteFill style={{ opacity: grain, mixBlendMode: "overlay" }}>
      <Img src={staticFile("assets/grain.png")} style={{ width: "100%", height: "100%" }} />
    </AbsoluteFill>
  </>
);
