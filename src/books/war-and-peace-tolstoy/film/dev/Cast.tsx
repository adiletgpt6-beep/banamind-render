// Лист силуэтов (проверка стиля): все герои рядом, разные позы.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Figure, LOOKS, type FigPose, type Who } from "../visuals/draw";
import { C, FONT } from "../theme";

const POSES: FigPose[] = ["stand", "walk", "run", "sit", "reach", "dance", "kneel", "point", "bow", "read", "arms", "banner", "look"];

export const Cast: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.indigo}, ${C.fog})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => {
          const x = 90 + (i % 14) * 135;
          const y = i < 14 ? 480 : 1000;
          return (
            <g key={w}>
              <Figure who={w} x={x} y={y} s={0.72} pose={POSES[i % POSES.length]} t={1} />
              <text x={x} y={y + 30} fontFamily={FONT} fontWeight={800} fontSize={20} fill="#fff" textAnchor="middle">
                {w}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
