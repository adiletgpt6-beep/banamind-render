// Технический лист персонажей: позы и ракурсы (проверка модели).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Character } from "./rig/Character";
import { AMIR, BILAL, EXTRA_KIDS, TEACHER, YUSUF } from "./rig/looks";
import { FACE0 } from "./rig/pose";
import { kneel, sitCross, stand } from "./rig/presets";

export const RigTest: React.FC = () => {
  const frame = useCurrentFrame();
  const yaw = Math.sin(frame / 20) * 0.6;
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        <rect x={0} y={760} width={1920} height={320} fill="#c98f7a" />
        <Character uid="t1" look={TEACHER} pose={stand(TEACHER, 0.5)} face={FACE0} x={200} y={1000} scale={0.9} />
        <Character uid="t2" look={TEACHER} pose={kneel(TEACHER, 0.5)} face={{ ...FACE0, smile: 0.5 }} x={520} y={1000} scale={0.9} />
        <Character uid="y1" look={YUSUF} pose={sitCross(YUSUF, -0.5)} face={{ ...FACE0, gaze: { x: -0.6, y: 0 } }} x={820} y={1000} scale={0.9} />
        <Character uid="a1" look={AMIR} pose={sitCross(AMIR, yaw)} face={{ ...FACE0, mouthOpen: 0.6, mouthWide: 0.4 }} x={1080} y={1000} scale={0.9} />
        <Character uid="b1" look={BILAL} pose={stand(BILAL, -0.4)} face={FACE0} x={1340} y={1000} scale={0.9} />
        <Character uid="b2" look={BILAL} pose={sitCross(BILAL, 0)} face={{ ...FACE0, blink: 1 }} x={1600} y={1000} scale={0.9} />
        <Character uid="y2" look={YUSUF} pose={stand(YUSUF, 0.3)} face={FACE0} x={1820} y={1000} scale={0.9} />
        {EXTRA_KIDS.slice(0, 11).map((k, i) => (
          <Character key={i} uid={`k${i}`} look={k.look} pose={sitCross(k.look, -0.45)} face={FACE0} x={90 + i * 175} y={520} scale={0.62} />
        ))}
        {EXTRA_KIDS.slice(11).map((k, i) => (
          <Character key={i} uid={`kk${i}`} look={k.look} pose={sitCross(k.look, 0.3)} face={FACE0} x={90 + i * 175} y={760} scale={0.62} />
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const HeadTest: React.FC = () => {
  const looks = [TEACHER, YUSUF, AMIR, BILAL];
  const yaws = [-0.6, -0.3, 0, 0.3, 0.6];
  return (
    <AbsoluteFill style={{ background: "#F6F1E8" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080">
        {looks.map((l, r) =>
          yaws.map((y, c) => {
            const p = stand(l, y);
            p.headYaw = y;
            return (
              <g key={`${r}-${c}`} transform={`translate(${200 + c * 380} ${300 + r * 260}) scale(1.0)`}>
                <g transform="scale(1.4)">
                  <Character uid={`h${r}${c}`} look={l} pose={p} face={{ ...FACE0, smile: c / 4, mouthOpen: c === 2 ? 0.5 : 0 }} x={0} y={l.body.height - 40} scale={1} shadow={false} />
                </g>
              </g>
            );
          }),
        )}
      </svg>
    </AbsoluteFill>
  );
};
