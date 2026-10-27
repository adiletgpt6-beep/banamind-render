// Контрольный лист поз ведущего (только для проверки, не входит в выпуск).
import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Horse } from "../horse/Horse";
import { POSES, PoseName, makeState } from "../horse/rig";
import { C, FONT } from "../theme";

export const PoseSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const names = Object.keys(POSES) as PoseName[];
  return (
    <AbsoluteFill style={{ background: C.cream, flexDirection: "row", flexWrap: "wrap", fontFamily: FONT }}>
      {names.map((n, i) => (
        <div key={n} style={{ width: 384, height: 540, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", bottom: 0, left: 42 }}>
            <Horse width={300} s={makeState({ frame: frame + i * 7, fps, pose: POSES[n], mouthOpen: i % 3 === 0 ? 0.7 : 0, mouthRound: i % 2 ? 0.6 : 0, speaking: 0 })} />
          </div>
          <div style={{ position: "absolute", top: 8, left: 12, fontSize: 28, fontWeight: 800, color: C.navy }}>{n}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};
