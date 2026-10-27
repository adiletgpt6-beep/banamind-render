// Лист персонажей (проверка стиля): все герои рядом, разные позы и эмоции.
import React from "react";
import { AbsoluteFill } from "remotion";
import { LOOKS, Person, type FigMood, type FigPose, type Who } from "../visuals/draw";
import { C, FONT } from "../theme";

const MOODS: FigMood[] = ["neutral", "sad", "tense", "kind", "angry", "smile", "shock", "closed"];
const POSES: FigPose[] = ["stand", "walk", "read", "reach", "point", "hold", "kneel", "bow", "cover", "sit"];

export const Cast: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.dusk}, ${C.fog})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => {
          const x = 100 + (i % 10) * 180;
          const y = i < 10 ? 500 : 1020;
          return (
            <g key={w}>
              <Person who={w} x={x} y={y} s={0.82} mood={MOODS[i % MOODS.length]} pose={POSES[i % POSES.length]} t={1} />
              <text x={x} y={y + 34} fontFamily={FONT} fontWeight={800} fontSize={22} fill="#fff" textAnchor="middle">
                {w}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
