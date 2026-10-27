// The planet: a lit sphere (Sun on the left), soft terminator, atmosphere,
// continents that turn with the spin, and a small marker that travels from
// day into night. World-space component (inside the camera transform).

import React from "react";
import { rise } from "../engines/SceneTransitionEngine.ts";
import { PALETTE } from "../styles/palette.ts";
import { CONTINENTS, E, MARKER, R, project } from "../episodes/ep001/world.ts";
import { continentPath } from "../scenes/s2-day-night.ts";

export const continentsAlpha = (f: number) =>
  Math.max(0, Math.min(1, 1 - rise(f, 398, 428) + rise(f, 1110, 1160)));

export const dayNight = (f: number) => rise(f, 300, 336);

export const Planet: React.FC<{ f: number; zoom: number }> = ({ f, zoom }) => {
  const body = rise(f, 76, 100);
  if (body <= 0) return null;
  const dn = dayNight(f);
  const cont = continentsAlpha(f);
  const m = project(MARKER.lon, MARKER.lat, f);
  const markerOn = rise(f, 300, 320) * (1 - rise(f, 396, 420));
  const markerDay = m.p.x < E.x - 10 ? 1 : m.p.x > E.x + 30 ? 0 : 1 - (m.p.x - E.x + 10) / 40;
  return (
    <g opacity={body}>
      <defs>
        <radialGradient id="planet-body" gradientUnits="userSpaceOnUse" cx={E.x - 120} cy={E.y - 100} r={R * 1.45}>
          <stop offset="0" stopColor="#3A8DB3" />
          <stop offset="0.42" stopColor="#1C557F" />
          <stop offset="0.8" stopColor="#123557" />
          <stop offset="1" stopColor="#0C2440" />
        </radialGradient>
        <linearGradient id="planet-night" gradientUnits="userSpaceOnUse" x1={E.x - 46} y1={0} x2={E.x + 64} y2={0}>
          <stop offset="0" stopColor="#040914" stopOpacity="0" />
          <stop offset="1" stopColor="#040914" stopOpacity="0.8" />
        </linearGradient>
        <radialGradient id="planet-atmo">
          <stop offset="0.9" stopColor={PALETTE.blue} stopOpacity="0" />
          <stop offset="0.935" stopColor={PALETTE.blue} stopOpacity="0.26" />
          <stop offset="1" stopColor={PALETTE.blue} stopOpacity="0" />
        </radialGradient>
        <linearGradient id="planet-rim" gradientUnits="userSpaceOnUse" x1={E.x - R} y1={0} x2={E.x + 20} y2={0}>
          <stop offset="0" stopColor={PALETTE.gold} stopOpacity="0.5" />
          <stop offset="1" stopColor={PALETTE.gold} stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx={E.x} cy={E.y} r={R * 1.075} fill="url(#planet-atmo)" />
      <circle cx={E.x} cy={E.y} r={R} fill="url(#planet-body)" />
      {/* continents (fill) */}
      <g opacity={cont}>
        {CONTINENTS.map((c, i) => (
          <path
            key={c.id}
            d={continentPath(c.id)(f)}
            fill={PALETTE.gold}
            opacity={0.17 * rise(f, 286 + i * 7, 306 + i * 7)}
          />
        ))}
      </g>
      {/* before the Sun of scene 2 the planet is uniformly in twilight */}
      <circle cx={E.x} cy={E.y} r={R} fill="#060C18" opacity={0.5 * (1 - dn)} />
      {/* night side */}
      <circle cx={E.x} cy={E.y} r={R} fill="url(#planet-night)" opacity={dn} />
      {/* warm rim light on the day side */}
      <circle cx={E.x} cy={E.y} r={R - 2 / zoom} fill="none" stroke="url(#planet-rim)" strokeWidth={10 / zoom} opacity={dn * 0.8} />
      {markerOn > 0.01 && m.z > 0 ? (
        <g opacity={markerOn}>
          <circle cx={m.p.x} cy={m.p.y} r={15 / zoom} fill={markerDay > 0.5 ? PALETTE.goldHot : PALETTE.blue} opacity={0.25} />
          <circle cx={m.p.x} cy={m.p.y} r={7 / zoom} fill={markerDay > 0.5 ? PALETTE.white : PALETTE.moon} />
        </g>
      ) : null}
    </g>
  );
};
