// Scene 4 (25–35 s) — the leaf: x-ray, veins, plant cells.
import React from "react";
import * as THREE from "three";
import { CUE } from "../compositions/cues";
import { CELLS } from "../compositions/layout";
import { leafAnchor } from "../components/Leaf3D";
import { cellsAppear } from "../components/PlantCell";
import { C, Label, Note } from "../components/Typography";
import { project } from "../utils/project";
import { window4 } from "../utils/math";

/** Magnifier callout: from a spot on the leaf to the tissue block. */
const Callout: React.FC<{ t: number }> = ({ t }) => {
  const k = cellsAppear(t);
  if (k <= 0.01) return null;
  const spot = project(leafAnchor("palisade", t, 0.7, 0.75), "leaf", t);
  const corners = [[-0.8, 0.58, 0.5], [0.8, 0.58, 0.5], [-0.8, -0.57, 0.5], [0.8, -0.57, 0.5]].map(([x, y, z]) =>
    project(
      new THREE.Vector3(x, y, z).multiplyScalar(CELLS.scale * (0.15 + 0.85 * k)).applyEuler(CELLS.rotation).add(CELLS.position),
      "leaf", t,
    ),
  );
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
      {corners.map((c, i) => (
        <line key={i} x1={spot.x} y1={spot.y} x2={c.x} y2={c.y} stroke={C.gold} strokeWidth={2} strokeDasharray="7 7" opacity={0.55 * k} />
      ))}
      <rect x={spot.x - 16} y={spot.y - 16} width={32} height={32} fill="none" stroke={C.gold} strokeWidth={3} opacity={k} rx={4} />
    </svg>
  );
};

export const Scene04Leaf: React.FC<{ t: number }> = ({ t }) => {
  const kv = window4(t, CUE.veins + 0.5, CUE.veins + 1.0, 32.0, 32.4);
  const v = project(leafAnchor("veins", t, 0.42, 0.5), "leaf", t);
  const kc = window4(t, CUE.cells + 0.1, CUE.cells + 0.6, 34.6, 35.1);
  const c = project(CELLS.position.clone().add(new THREE.Vector3(0, 0.42, 0)), "leaf", t);
  return (
    <>
      <Label x={v.x} y={v.y} dx={-170} dy={170} text="ПРОЖИЛКИ" k={kv} />
      <Callout t={t} />
      <Label x={c.x} y={c.y} dx={-60} dy={-150} text="КЛЕТКИ РАСТЕНИЯ" k={kc} size={42} />
      <Note text="Увеличенная схема" k={kc} y={1560} />
    </>
  );
};
