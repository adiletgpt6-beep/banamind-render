// Scene 2 (6–15 s) — rotation explains day/night; then the layers.
import React from "react";
import { CUE } from "../compositions/cues";
import { EARTH, SUN_DIR } from "../compositions/layout";
import { earthLayerAnchor } from "../components/Earth3D";
import { C, HEAD, Label, Note, reveal, shadow } from "../components/Typography";
import { EARTH_LABELS } from "../engines/ScientificCutawayEngine";
import { project, projectedRadius } from "../utils/project";
import { window4 } from "../utils/math";

const DayNight: React.FC<{ t: number }> = ({ t }) => {
  const k = window4(t, CUE.dayNight - 0.2, CUE.dayNight + 0.5, 9.6, 10.1);
  if (k <= 0) return null;
  const c = project(EARTH.position, "earth", t);
  const r = projectedRadius(EARTH.position, 1, "earth", t);
  const tag = (text: string, x: number, color: string, bg: string): React.ReactNode => (
    <div style={{ position: "absolute", left: x - 140, width: 280, top: c.y + r + 40, textAlign: "center", ...reveal(k) }}>
      <span style={{ fontFamily: HEAD, fontWeight: 600, fontSize: 40, letterSpacing: 3, color, padding: "10px 26px", borderRadius: 40, background: bg, textShadow: shadow }}>
        {text}
      </span>
    </div>
  );
  const sunLeft = SUN_DIR.x < 0;
  // eastward rotation arrow drawn as an arc over the globe (west → east)
  const R = r * 1.14, a0 = 200, a1 = 340, draw = Math.min(1, k * 1.2);
  const pt = (deg: number) => [c.x + R * Math.cos((deg * Math.PI) / 180), c.y + R * Math.sin((deg * Math.PI) / 180) * 0.42 - r * 0.2];
  const steps = Array.from({ length: 41 }, (_, i) => pt(a0 + ((a1 - a0) * i * draw) / 40));
  const end = steps[steps.length - 1], prev = steps[steps.length - 3];
  const ang = Math.atan2(end[1] - prev[1], end[0] - prev[0]);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: k }}>
        <polyline points={steps.map((p) => p.join(",")).join(" ")} fill="none" stroke={C.gold} strokeWidth={7} strokeLinecap="round" />
        <polygon
          points={[[22, 0], [-12, -14], [-12, 14]].map(([x, y]) => [end[0] + x * Math.cos(ang) - y * Math.sin(ang), end[1] + x * Math.sin(ang) + y * Math.cos(ang)].join(",")).join(" ")}
          fill={C.gold}
        />
      </svg>
      {tag("ДЕНЬ", c.x + (sunLeft ? -1 : 1) * r * 0.55, C.deep, "rgba(239,195,116,0.95)")}
      {tag("НОЧЬ", c.x + (sunLeft ? 1 : -1) * r * 0.55, C.milk, "rgba(25,79,136,0.85)")}
      <div style={{ position: "absolute", left: 0, right: 0, top: c.y - r - 150, textAlign: "center", fontFamily: HEAD, fontWeight: 600, fontSize: 40, color: C.milk, textShadow: shadow, ...reveal(k) }}>
        Земля <span style={{ color: C.gold }}>вращается</span>
      </div>
    </>
  );
};

export const Scene02EarthLayers: React.FC<{ t: number }> = ({ t }) => {
  const dirs: Record<string, [number, number]> = { crust: [230, -110], mantle: [250, -30], outerCore: [260, 50] };
  return (
    <>
      <DayNight t={t} />
      {EARTH_LABELS.map((l, i) => {
        const k = window4(t, 11.3 + i * 0.22, 11.85 + i * 0.22, 12.95, 13.3);
        if (k <= 0) return null;
        const a = project(earthLayerAnchor(l.layer, t), "earth", t);
        const [dx, dy] = dirs[l.layer];
        return <Label key={l.layer} x={a.x} y={a.y} dx={dx} dy={dy} text={l.text} k={k} />;
      })}
      <Note text="Схема. Не в масштабе" k={window4(t, 11.2, 11.8, 13.9, 14.4)} y={1560} />
    </>
  );
};
