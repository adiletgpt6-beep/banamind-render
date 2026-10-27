import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { HERO_SEATS, SEATS, TEACHER_SPOT } from "./layout";
import { AMIR, BILAL, EXTRA_KIDS, TEACHER, YUSUF } from "./rig/looks";
import { FACE0 } from "./rig/pose";
import { kneel, sitCross } from "./rig/presets";
import { type CharState, World } from "./World";

export const WorldTest: React.FC<{ vb?: string }> = ({ vb = "0 0 3840 2160" }) => {
  const frame = useCurrentFrame();
  const heroes: Record<number, typeof YUSUF> = { [HERO_SEATS.yusuf]: YUSUF, [HERO_SEATS.amir]: AMIR, [HERO_SEATS.bilal]: BILAL };
  let k = 0;
  const chars: CharState[] = SEATS.map((seat, i) => {
    const look = heroes[i] ?? EXTRA_KIDS[k++].look;
    return { id: look.key, look, x: seat.x, y: seat.y, pose: sitCross(look, -0.45), face: { ...FACE0, gaze: { x: -0.5, y: 0.1 } } };
  });
  chars.push({ id: "teacher", look: TEACHER, x: TEACHER_SPOT.x, y: TEACHER_SPOT.y, pose: kneel(TEACHER, 0.5), face: { ...FACE0, smile: 0.5 } });
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox={vb}>
        <World s={{ t: frame / 30, chars, cards: { before: 1, after: 1, earth: 1, people: 1 }, captions: { before: "Домика ещё нет", after: "Домик построен" }, treeInBox: true, boxCubes: 0 }} />
      </svg>
    </AbsoluteFill>
  );
};
