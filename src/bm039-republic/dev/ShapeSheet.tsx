// Служебный лист: каждая фигура из точек отдельным кадром (для проверки рисунков).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { DotField } from "../dots/DotField";
import { SHAPE_KINDS, type ShapeSpec } from "../dots/shapes";
import { FONT } from "../theme";

const EXTRA: ShapeSpec[] = [
  { kind: "cave", lit: 0 },
  { kind: "cave", lit: 1 },
  { kind: "cave", lit: 1, exit: 1, free: 1 },
  { kind: "cave", lit: 1, exit: 1, free: 1.6 },
];
const LIST: ShapeSpec[] = [...EXTRA, ...SHAPE_KINDS.map((kind) => ({ kind }))];

export const ShapeSheet: React.FC = () => {
  const f = useCurrentFrame();
  const spec = { x: 960, y: 540, s: 0.95, ...LIST[f % LIST.length] };
  return (
    <AbsoluteFill>
      <Background part="b67" prev="b67" k={1} />
      <DotField keys={[{ t: -10, shape: spec }]} t={5} />
      <div style={{ position: "absolute", left: 40, top: 30, color: "#fff", fontFamily: FONT, fontSize: 40 }}>{JSON.stringify(LIST[f % LIST.length])}</div>
    </AbsoluteFill>
  );
};
