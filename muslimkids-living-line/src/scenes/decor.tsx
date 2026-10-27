// World-space fills and light for every scene. The golden contours come
// from the LivingLine; these components only add volume, colour and light
// to the shapes the line has already drawn (and fade in after it).

import React from "react";
import { Easing } from "remotion";
import { rise } from "../engines/SceneTransitionEngine.ts";
import { visibleRange, type Stroke } from "../engines/LivingLineEngine.ts";
import { arcPath, dist, linePath, polar, smoothPath, sparklePoints, v, type Vec } from "../utils/geometry.ts";
import { FONTS, PALETTE } from "../styles/palette.ts";
import {
  E,
  HILL_TOP,
  ORN_C,
  ORN_INNER,
  ORN_R,
  R,
  SUN1_R,
  SUN1_X,
  SUN2_C,
  SUN2_R,
  TREE_U,
  sun1Y,
  surf,
} from "../episodes/ep001/world.ts";
import { crescent } from "./s1-sunrise.ts";
import { CLOUD, FOOTHILLS, RIDGE, local } from "./s3-world.ts";
import { SEED } from "./s4-tree.ts";
import { CONSTELLATION } from "./s5-signs.ts";
import { ornTurn } from "./s6-ornament.ts";
import { STARS, boyPoints, hillY } from "./s7-question.ts";
import type { Camera } from "../engines/CameraController.ts";

type P = { f: number; cam: Camera; journey: Stroke[] };

/** Clip / mask definitions in world space. */
export const WorldDefs: React.FC = () => (
  <defs>
    <clipPath id="clip-sky">
      <path
        clipRule="evenodd"
        d={`M -6000 -6000 H 6000 V 6000 H -6000 Z ${arcPath(E, R, 0, Math.PI * 2)} Z`}
      />
    </clipPath>
    <linearGradient id="daylight-grad" gradientUnits="userSpaceOnUse" x1={E.x - 40} y1={0} x2={E.x + 60} y2={0}>
      <stop offset="0" stopColor="#fff" />
      <stop offset="1" stopColor="#3a3a3a" />
    </linearGradient>
    <mask id="mask-daylight" maskUnits="userSpaceOnUse" x={-6000} y={-6000} width={12000} height={14000}>
      <rect x={-6000} y={-6000} width={12000} height={14000} fill="url(#daylight-grad)" />
    </mask>
  </defs>
);

// ── Scene 1 ───────────────────────────────────────────────────────────────
export const SunriseDecor: React.FC<P> = ({ f }) => {
  const light = rise(f, 106, 132) * (1 - rise(f, 146, 172));
  const moon = rise(f, 152, 176);
  const c = v(SUN1_X, sun1Y(f));
  return (
    <g>
      <defs>
        <radialGradient id="sun1-disc">
          <stop offset="0" stopColor="#FFF4D2" />
          <stop offset="0.6" stopColor="#FAD27E" />
          <stop offset="1" stopColor="#F2B25A" />
        </radialGradient>
        <radialGradient id="moon-disc" gradientUnits="userSpaceOnUse" cx={SUN1_X + 20} cy={-372} r={40}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor={PALETTE.moon} stopOpacity="0.55" />
        </radialGradient>
      </defs>
      {light > 0.01 ? (
        <g clipPath="url(#clip-sky)">
          <ellipse cx={-40} cy={-300} rx={330} ry={150} fill="url(#warm-light)" opacity={0.55 * light} />
          <circle cx={c.x} cy={c.y} r={SUN1_R * 3.4} fill="url(#warm-light)" opacity={0.75 * light} />
          <circle cx={c.x} cy={c.y} r={SUN1_R} fill="url(#sun1-disc)" opacity={light} />
        </g>
      ) : null}
      {moon > 0.01 ? (
        <g opacity={moon}>
          <circle cx={SUN1_X + 8} cy={-372} r={SUN1_R * 2.7} fill="url(#cool-light)" opacity={0.45} />
          <path d={crescent.d} fill="url(#moon-disc)" />
        </g>
      ) : null}
    </g>
  );
};

// ── Scene 2 ───────────────────────────────────────────────────────────────
export const SunDecor: React.FC<P> = ({ f }) => {
  const on = rise(f, 322, 342);
  if (on <= 0.01) return null;
  return (
    <g opacity={on}>
      <circle cx={SUN2_C.x} cy={SUN2_C.y} r={SUN2_R * 3.6} fill="url(#warm-light)" opacity={0.7} />
      <circle cx={SUN2_C.x} cy={SUN2_C.y} r={SUN2_R} fill="url(#sun1-disc)" />
    </g>
  );
};

export const DayNightLabels: React.FC<P> = ({ f }) => {
  const day = rise(f, 318, 334) * (1 - rise(f, 398, 410));
  const night = rise(f, 370, 384) * (1 - rise(f, 398, 410));
  if (day + night <= 0.01) return null;
  const label = (x: number, text: string, color: string, o: number, glow: string) => (
    <g opacity={o} transform={`translate(${x} ${R + 92}) translate(0 ${(1 - o) * 14})`}>
      <text
        textAnchor="middle"
        fontFamily={FONTS.title}
        fontWeight={900}
        fontSize={56}
        letterSpacing={10}
        fill={color}
        style={{ filter: `drop-shadow(0 0 14px ${glow})` }}
      >
        {text}
      </text>
    </g>
  );
  return (
    <g>
      {/* thin brackets under the two halves */}
      <path d={arcPath(E, R + 34, Math.PI * 0.62, Math.PI * 0.3)} stroke={PALETTE.gold} strokeWidth={3} fill="none" opacity={0.6 * day} strokeLinecap="round" />
      <path d={arcPath(E, R + 34, Math.PI * 0.38, -Math.PI * 0.3)} stroke={PALETTE.blue} strokeWidth={3} fill="none" opacity={0.6 * night} strokeLinecap="round" />
      {label(-170, "ДЕНЬ", PALETTE.goldHot, day, "rgba(248,201,106,0.55)")}
      {label(170, "НОЧЬ", PALETTE.moon, night, "rgba(117,214,232,0.5)")}
    </g>
  );
};

// ── Scenes 3–4 ────────────────────────────────────────────────────────────
const DISTANT: [number, number][] = [
  [180, 0], [160, 34], [138, 22], [116, 62], [96, 44], [70, 84], [46, 58], [22, 92], [0, 70],
  [-24, 98], [-50, 72], [-78, 90], [-104, 66], [-132, 82], [-160, 52], [-190, 64], [-230, 0],
];

export const LandDecor: React.FC<P> = ({ f, cam }) => {
  const on = rise(f, 396, 440);
  if (on <= 0.01) return null;
  const mtn = rise(f, 440, 520);
  // Soft parallax for the distant range (it lags behind the camera).
  const ref = surf(-40, 60);
  const px = (cam.x - ref.x) * 0.14;
  const py = (cam.y - ref.y) * 0.14;
  const ridge = local(RIDGE);
  const foot = local(FOOTHILLS);
  const base = Array.from({ length: 31 }, (_, i) => surf(-170 + ((130 + 170) * (30 - i)) / 30, -2));
  const cloud = local(CLOUD);
  const cloudOn = rise(f, 538, 566);
  return (
    <g opacity={on}>
      <defs>
        <radialGradient id="soil" gradientUnits="userSpaceOnUse" cx={E.x} cy={E.y} r={R}>
          <stop offset="0.7" stopColor="#0A101C" />
          <stop offset="0.93" stopColor="#1C1A28" />
          <stop offset="0.985" stopColor="#2E2530" />
          <stop offset="1" stopColor="#3A2D2C" />
        </radialGradient>
        <radialGradient id="mtn" gradientUnits="userSpaceOnUse" cx={E.x} cy={E.y} r={R + 70}>
          <stop offset={(R / (R + 70)).toFixed(3)} stopColor="#132B49" />
          <stop offset="1" stopColor="#2E5A86" />
        </radialGradient>
        <radialGradient id="mtn-far" gradientUnits="userSpaceOnUse" cx={E.x} cy={E.y} r={R + 100}>
          <stop offset={(R / (R + 100)).toFixed(3)} stopColor="#122640" />
          <stop offset="1" stopColor="#24456B" />
        </radialGradient>
        <radialGradient id="crown" gradientUnits="userSpaceOnUse" cx={surf(TREE_U - 6, 84).x} cy={surf(TREE_U - 6, 84).y} r={34}>
          <stop offset="0" stopColor={PALETTE.leafLight} />
          <stop offset="0.55" stopColor={PALETTE.leaf} />
          <stop offset="1" stopColor={PALETTE.leafDeep} />
        </radialGradient>
        <linearGradient id="trunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5A3D22" />
          <stop offset="0.5" stopColor="#9A7040" />
          <stop offset="1" stopColor="#5A3D22" />
        </linearGradient>
      </defs>
      {/* soil cross-section */}
      <circle cx={E.x} cy={E.y} r={R} fill="url(#soil)" opacity={1 - rise(f, 1000, 1070)} />
      {/* distant range (parallax) */}
      <g transform={`translate(${px} ${py})`} opacity={0.85 * mtn}>
        <path d={smoothPath(local(DISTANT), 0.6) + " " + linePath(local([[-230, -2], [180, -2]])).replace("M", "L") + " Z"} fill="url(#mtn-far)" />
      </g>
      {/* mountains */}
      <path d={`${smoothPath(ridge, 0.8)} ${smoothPath(foot, 0.8, false, false)} ${linePath(base).replace("M", "L")} Z`} fill="url(#mtn)" opacity={mtn} />
      {/* cloud */}
      {cloudOn > 0.01 ? (
        <g opacity={cloudOn}>
          <path d={smoothPath(cloud, 1) + " Z"} fill="#FFFFFF" opacity={0.14} />
          <path d={smoothPath(local(CLOUD, 0, 3), 1) + " Z"} fill="#FFFFFF" opacity={0.08} transform="scale(1)" />
        </g>
      ) : null}
      <Tree f={f} />
    </g>
  );
};

const Tree: React.FC<{ f: number }> = ({ f }) => {
  const seed = rise(f, 742, 754) * (1 - rise(f, 830, 860));
  const grow = Easing.inOut(Easing.cubic)(rise(f, 768, 840, (t) => t));
  const crown = rise(f, 852, 904, Easing.bezier(0.3, 1.3, 0.5, 1));
  const U = TREE_U;
  const top = -2 + 54 * grow;
  const wBase = 1.2 + 4 * grow;
  const wTop = 0.6 + 1.2 * grow;
  const trunk = [
    ...[0, 0.25, 0.5, 0.75, 1].map((k) => surf(U - (wBase + (wTop - wBase) * k) / 2 + (k === 1 ? 0 : 0), -4 + (top + 4) * k)),
    ...[1, 0.75, 0.5, 0.25, 0].map((k) => surf(U + (wBase + (wTop - wBase) * k) / 2, -4 + (top + 4) * k)),
  ];
  const blobs: [number, number, number][] = [
    [U, 70, 21], [U - 13, 66, 14], [U + 13, 66, 14], [U - 8, 81, 13], [U + 8, 81, 13], [U, 86, 10],
  ];
  return (
    <g>
      {seed > 0.01 ? <path d={smoothPath(local(SEED), 1)} fill="#C99A4E" opacity={0.8 * seed} /> : null}
      {grow > 0.01 ? <path d={linePath(trunk) + " Z"} fill="url(#trunk)" opacity={rise(f, 768, 790)} /> : null}
      {crown > 0.01 ? (
        <g opacity={Math.min(1, crown)}>
          {blobs.map(([u, h, r], i) => {
            const c = surf(u, h);
            const k = Math.max(0, Math.min(1.08, crown * 1.15 - i * 0.05));
            return <circle key={i} cx={c.x} cy={c.y} r={r * k} fill="url(#crown)" opacity={0.92} />;
          })}
          {blobs.slice(0, 4).map(([u, h, r], i) => {
            const c = surf(u - r * 0.25, h + r * 0.3);
            return <circle key={`h${i}`} cx={c.x} cy={c.y} r={r * 0.45 * crown} fill={PALETTE.leafLight} opacity={0.22} />;
          })}
        </g>
      ) : null}
    </g>
  );
};

// ── Scene 5 ───────────────────────────────────────────────────────────────
export const SkyDecor: React.FC<P> = ({ f, journey, cam }) => {
  const s = journey.find((k) => k.id === "s5-constellation");
  if (!s || f < s.from) return null;
  const range = visibleRange(s, f);
  const head = range ? range[1] : 0;
  let acc = 0;
  return (
    <g>
      {CONSTELLATION.map((p, i) => {
        if (i) acc += dist(CONSTELLATION[i - 1], p);
        const on = head >= acc - 0.5 || f > s.to ? 1 : 0;
        if (!on) return null;
        const tw = 0.8 + 0.2 * Math.sin(f / 9 + i * 1.7);
        const r = (13 / cam.zoom) * (i % 3 === 0 ? 1.25 : 1) * tw;
        return (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={r * 2.6} fill="url(#cool-light)" opacity={0.7} />
            <path d={linePath(sparklePoints(p, r)) + " Z"} fill="#FFFFFF" />
          </g>
        );
      })}
    </g>
  );
};

// ── Scene 6 ───────────────────────────────────────────────────────────────
export const OrnamentDecor: React.FC<P> = ({ f }) => {
  const on = rise(f, 1420, 1480) * (1 - rise(f, 1612, 1650));
  if (on <= 0.01) return null;
  const t = ornTurn(f);
  const star = Array.from({ length: 16 }, (_, i) => polar(ORN_C, i % 2 === 0 ? ORN_R : ORN_INNER, -Math.PI / 2 + t + (i * Math.PI) / 8));
  return (
    <g opacity={on}>
      <defs>
        <radialGradient id="orn-panel" gradientUnits="userSpaceOnUse" cx={ORN_C.x} cy={ORN_C.y} r={ORN_INNER}>
          <stop offset="0" stopColor="#060C18" stopOpacity="0.88" />
          <stop offset="0.8" stopColor="#060C18" stopOpacity="0.72" />
          <stop offset="1" stopColor="#060C18" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="orn-glow" gradientUnits="userSpaceOnUse" cx={ORN_C.x} cy={ORN_C.y} r={ORN_R * 1.1}>
          <stop offset="0.6" stopColor={PALETTE.gold} stopOpacity="0" />
          <stop offset="0.9" stopColor={PALETTE.gold} stopOpacity="0.07" />
          <stop offset="1" stopColor={PALETTE.gold} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx={ORN_C.x} cy={ORN_C.y} r={ORN_R * 1.1} fill="url(#orn-glow)" />
      <path d={linePath(star) + " Z"} fill={PALETTE.gold} opacity={0.06} />
      <circle cx={ORN_C.x} cy={ORN_C.y} r={ORN_INNER} fill="url(#orn-panel)" />
    </g>
  );
};

// ── Scene 7 ───────────────────────────────────────────────────────────────
export const HillDecor: React.FC<P> = ({ f, cam }) => {
  const on = rise(f, 1630, 1656);
  if (on <= 0.01) return null;
  const hill = Array.from({ length: 25 }, (_, i) => {
    const x = -600 + i * 50;
    return v(x, hillY(x));
  });
  const boy = rise(f, 1664, 1694);
  return (
    <g opacity={on}>
      <defs>
        <linearGradient id="hill" gradientUnits="userSpaceOnUse" x1={0} y1={HILL_TOP.y} x2={0} y2={HILL_TOP.y + 380}>
          <stop offset="0" stopColor="#12233B" />
          <stop offset="1" stopColor="#09111F" />
        </linearGradient>
      </defs>
      <ellipse cx={HILL_TOP.x + 40} cy={HILL_TOP.y - 30} rx={420} ry={210} fill="url(#cool-light)" opacity={0.35} />
      <path d={`${smoothPath(hill, 1)} L 600 ${HILL_TOP.y + 900} L -600 ${HILL_TOP.y + 900} Z`} fill="url(#hill)" />
      {boy > 0.01 ? <path d={smoothPath(boyPoints(), 0.85) + " Z"} fill="#1D3555" opacity={0.96 * boy} /> : null}
      {STARS.map((s, i) => {
        const on2 = rise(f, 1704 + i * 16, 1716 + i * 16);
        if (on2 <= 0.01) return null;
        return <circle key={i} cx={s.c.x} cy={s.c.y} r={(s.r * 3.2 * (0.9 + 0.1 * Math.sin(f / 6 + i))) } fill="url(#warm-light)" opacity={0.65 * on2} />;
      })}
      {/* a few tiny distant stars drawn as dots by the scene light */}
      {[v(-180, 2840), v(-90, 2930), v(300, 2960), v(-240, 3020), v(260, 2760)].map((p, i) => (
        <circle key={`d${i}`} cx={p.x} cy={p.y} r={2.4 / Math.max(0.6, cam.zoom / 1.7)} fill="#DDEFFF" opacity={on * (0.5 + 0.4 * Math.sin(f / 11 + i * 2))} />
      ))}
    </g>
  );
};

export type { Vec };
