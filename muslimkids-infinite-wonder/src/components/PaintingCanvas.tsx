// Холст: бумага → ночная лессировка (космос) → финальная картина.
import { useMemo } from "react";
import { DoubleSide, Vector3 } from "three";
import { shader, useTex } from "../materials";
import { paperFragment, paperVertex } from "../shaders/paper";
import { SPACE_SUN } from "../engines/LightingSystem";
import type { DirectorState } from "../engines/InfiniteWonderDirector";

export const PaintingCanvas: React.FC<{ st: DirectorState }> = ({ st }) => {
  const paper = useTex("textures/paper.jpg");
  const mat = useMemo(
    () =>
      shader({
        vertexShader: paperVertex,
        fragmentShader: paperFragment,
        transparent: true,
        side: DoubleSide,
        uniforms: {
          uPaper: { value: paper },
          // Тень от Земли: смещение центра по проекции солнечных лучей на холст.
          uSunXY: { value: new Vector3(SPACE_SUN.x / SPACE_SUN.z, SPACE_SUN.y / SPACE_SUN.z, 0) },
          uLift: { value: 0 },
          uSpaceWash: { value: 0 },
          uPaperFade: { value: 0 },
          uSky: { value: 0 },
          uFar: { value: 0 },
          uNear: { value: 0 },
          uTree: { value: 0 },
          uMeadow: { value: 0 },
          uFinalWet: { value: 0 },
        },
      }),
    [paper],
  );
  const p = st.paint;
  const u = mat.uniforms;
  u.uLift.value = st.earth.lift;
  u.uSpaceWash.value = p.spaceWash;
  u.uPaperFade.value = p.paperFade;
  u.uSky.value = p.final.sky;
  u.uFar.value = p.final.far;
  u.uNear.value = p.final.near;
  u.uTree.value = p.final.tree;
  u.uMeadow.value = p.final.meadow;
  u.uFinalWet.value = p.finalWet;
  if (p.paperFade >= 0.999) return null;
  return (
    <mesh material={mat} position={[0, -1, 0]} renderOrder={-2}>
      <planeGeometry args={[90, 90, 1, 1]} />
    </mesh>
  );
};
