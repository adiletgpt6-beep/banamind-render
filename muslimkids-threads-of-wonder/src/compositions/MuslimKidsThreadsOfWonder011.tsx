// Главная композиция: «Удивительная картина мира» (MUSLIM KIDS, эксперимент 011).
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { ThreadWorld } from "../components/ThreadWorld";
import { Typography } from "../components/Typography";
import { frameState } from "../engines/ThreadsOfWonderEngine";
import { setLodScale } from "../geometry/TubeBuilder";

export const MuslimKidsThreadsOfWonder011: React.FC<{ lod?: number; withAudio?: boolean }> = ({ lod = 1, withAudio = true }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  setLodScale(lod);
  const state = useMemo(() => frameState(frame), [frame]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(120% 80% at 50% 38%, #0f2742 0%, #0b1d33 45%, #081626 100%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
        camera={{ fov: 30, near: 0.02, far: 120, position: [0, 0, 1] }}
      >
        <ThreadWorld state={state} />
      </ThreeCanvas>
      <Typography />
      {withAudio && <Audio src={staticFile("audio/mix.wav")} />}
    </AbsoluteFill>
  );
};
