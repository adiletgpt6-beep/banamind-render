// Служебный лист поз и выражений банана (для проверки модели, не входит в урок).
import React from "react";
import { AbsoluteFill } from "remotion";
import { Banana, MOODS, POSES, type MoodName, type PoseName } from "../../banana-host";

export const PoseSheet: React.FC = () => {
  const poses = Object.keys(POSES) as PoseName[];
  const moods = Object.keys(MOODS) as MoodName[];
  return (
    <AbsoluteFill style={{ background: "#e9f6ff" }}>
      <svg viewBox="0 0 1920 1080" width={1920} height={1080}>
        {poses.map((p, i) => (
          <g key={p} transform={`translate(${130 + (i % 8) * 235} ${i < 8 ? 480 : 1020}) scale(0.62)`}>
            <Banana pose={POSES[p]} face={MOODS[moods[i % moods.length]]} mouthOpen={i % 3 === 0 ? 0.7 : 0} mouthRound={i % 2 ? 0.6 : 0} blink={0} t={0.3} talk={0} />
            <text y={60} textAnchor="middle" fontSize={44} fontFamily="Nunito" fill="#24324a">{p}/{moods[i % moods.length]}</text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};
