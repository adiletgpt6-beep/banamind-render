import React from "react";
import { Composition } from "remotion";
import { MuslimKidsLayersOfReality012 } from "./compositions/MuslimKidsLayersOfReality012";
import { DURATION_IN_FRAMES, FPS } from "./compositions/cues";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimKidsLayersOfReality012"
    component={MuslimKidsLayersOfReality012}
    durationInFrames={DURATION_IN_FRAMES}
    fps={FPS}
    width={1080}
    height={1920}
    defaultProps={{ audio: true }}
  />
);
