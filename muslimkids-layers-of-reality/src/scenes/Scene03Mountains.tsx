// Scene 3 (15–25 s) — mountains and the rock beneath them.
import React from "react";
import { strataAnchor } from "../components/MountainLandscape";
import { Label, Note } from "../components/Typography";
import { project } from "../utils/project";
import { window4 } from "../utils/math";

export const Scene03Mountains: React.FC<{ t: number }> = ({ t }) => {
  const k = window4(t, 20.7, 21.3, 22.7, 23.1);
  const a = project(strataAnchor(2, t), "mountains", t);
  return (
    <>
      <Label x={a.x} y={a.y} dx={-60} dy={300} text="ГОРНЫЕ ПОРОДЫ" align="left" k={k} />
      <Note text="Схематическая модель" k={window4(t, 20.4, 21.0, 23.4, 23.9)} y={1560} />
    </>
  );
};
