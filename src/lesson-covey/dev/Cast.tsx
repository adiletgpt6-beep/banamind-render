// Лист персонажей (проверка стиля): все герои рядом, разные позы и эмоции.
import React from "react";
import { AbsoluteFill } from "remotion";
import { LOOKS, Person, type FigMood, type FigPose, type Who } from "../visuals/draw";
import { C, FONT } from "../theme";

const MOODS: FigMood[] = ["neutral", "happy", "sad", "tense", "angry", "calm", "shock", "think", "closed", "happy", "calm"];
const POSES: FigPose[] = ["stand", "walk", "phone", "point", "open", "cross", "hold", "wave", "think", "hug", "write"];

export const Cast: React.FC = () => {
  const all = Object.keys(LOOKS) as Who[];
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${C.skyDeep}, ${C.sky})` }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {all.map((w, i) => {
          const x = 150 + (i % 6) * 320;
          const y = i < 6 ? 500 : 1010;
          return (
            <g key={w}>
              <Person who={w} x={x} y={y} s={0.9} mood={MOODS[i % MOODS.length]} pose={POSES[i % POSES.length]} t={1} />
              <text x={x} y={y + 40} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#fff" textAnchor="middle">
                {w}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
