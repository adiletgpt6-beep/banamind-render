import React from "react";
import { getInputProps } from "remotion";

// profiling aid: --props='{"off":"S,L"}' disables layers
const OFF = String((getInputProps() as { off?: string }).off ?? "").split(",");
import { EarthCanvas } from "../components/EarthCanvas";
import { ForestCanvas } from "../components/ForestCanvas";
import { CrownCanvas } from "../components/CrownCanvas";
import { CloudLayer } from "../components/CloudLayer";
import { LeafBody } from "../components/Leaf";
import { WaterDrop } from "../components/WaterDrop";
import { LeafSurfaceContent } from "../components/LeafSurface";
import { LeafSectionContent } from "../components/LeafSection";
import { PlantCellContent } from "../components/PlantCell";
import { Starfield } from "../components/Starfield";
import { frameAt, flipAngle } from "../engines/SpaceMap";
import { ANCHOR_LEAF_DROP, FLIP_J0, FLIP_J1, svgTransform } from "../engines/NestedWorldEngine";
import { CX } from "../engines/InfiniteCameraEngine";
import { clamp, smoothstep } from "../engines/math";

// Scenes 1–5: one continuous multi-scale world. Layers are cross-faded by the
// NestedWorldEngine (level of detail) — never cut.
export const WorldJourney: React.FC<{ t: number }> = ({ t }) => {
  const f = frameAt(t);
  const { J, ws } = f;
  const a = ws.alpha;
  const dof = clamp((J - 14.3) * 7, 0, 16); // depth of field once we are at macro distance
  const earthAlpha = a.earth * (1 - smoothstep(55.4, 56.4, t));
  const showS = J > 19.0 && J < FLIP_J1 + 0.01;
  const th = flipAngle(ws.flip);
  const sv = ws.S, xv = ws.X;
  const inFlip = J > FLIP_J0 && J < FLIP_J1;
  // visible rectangle of the surface world (vertical extent grows while the plane tilts away)
  const sy = 1 / Math.max(0.15, Math.cos(th));
  const sView = { x0: sv.c.x - 600 / sv.m, x1: sv.c.x + 600 / sv.m, y0: sv.c.y - (1000 * sy) / sv.m, y1: sv.c.y + (1000 * sy + (inFlip ? 700 : 0)) / sv.m };
  return (
    <>
      <Starfield t={t} opacity={1 - smoothstep(1.8, 3.4, J)} zoom={1 + Math.max(0, J) * 0.04} />
      {earthAlpha > 0 && <EarthCanvas p={f.earth} opacity={earthAlpha} />}
      {a.F > 0 && !OFF.includes("F") && <ForestCanvas v={ws.F} opacity={a.F} blur={dof * 0.8} />}
      {a.T > 0 && !OFF.includes("T") && <CrownCanvas v={ws.T} opacity={a.T} blur={dof} />}
      {a.clouds > 0 && <CloudLayer J={J} opacity={a.clouds} />}
      {(showS || a.L > 0 || a.X > 0) && (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <defs>
            <clipPath id="aboveCut"><rect x={0} y={0} width={1080} height={f.cutY} /></clipPath>
            <clipPath id="belowCut"><rect x={0} y={f.cutY} width={1080} height={1920} /></clipPath>
          </defs>
          {showS && !inFlip && !OFF.includes("S") && (
            <g transform={svgTransform(sv)}><LeafSurfaceContent id="fullS" view={sView} /></g>
          )}
          {inFlip && (
            <>
              {/* the front piece of the cut leaf drops away */}
              <g clipPath="url(#belowCut)" opacity={1 - smoothstep(0, 0.45, ws.flip)}>
                <g transform={`translate(${CX} ${f.cutY + ws.flip * 700}) scale(${sv.m}) translate(${-sv.c.x} ${-sv.c.y})`}>
                  <LeafSurfaceContent id="frontS" view={sView} />
                </g>
              </g>
              {/* the remaining surface tilts away … */}
              <g clipPath="url(#aboveCut)">
                <g transform={`translate(${CX} ${f.cutY}) scale(${sv.m} ${sv.m * Math.cos(th)}) translate(${-sv.c.x} ${-sv.c.y})`}>
                  <LeafSurfaceContent id="backS" view={sView} />
                </g>
                <rect x={0} y={0} width={1080} height={f.cutY} fill="#081426" opacity={0.15 + 0.5 * ws.flip} />
              </g>
              {/* … and the cut face (the section) turns toward us */}
              <g transform={`translate(${CX} ${f.cutY}) scale(${xv.m} ${xv.m * Math.sin(th)})`}>
                <LeafSectionContent />
              </g>
              <rect x={0} y={f.cutY} width={1080} height={Math.max(0, xv.m * 390 * Math.sin(th))} fill="#081426" opacity={0.55 * (1 - ws.flip)} />
            </>
          )}
          {!inFlip && a.X > 0 && (
            <g transform={svgTransform(xv)}><LeafSectionContent hideTarget={a.C} /></g>
          )}
          {a.C > 0 && (
            <g transform={svgTransform(ws.C)} opacity={a.C}><PlantCellContent /></g>
          )}
          {a.L > 0 && !OFF.includes("L") && (
            <g transform={svgTransform(ws.L)} opacity={a.L}>
              <LeafBody shadow={J < 17.6} />
              {!OFF.includes("D") && <WaterDrop c={ANCHOR_LEAF_DROP} J={J} />}
            </g>
          )}
        </svg>
      )}
    </>
  );
};
