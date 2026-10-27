import React from "react";
import { Composition } from "remotion";
import { Episode001 } from "./episodes/ep001/Episode001.tsx";
import { DURATION, FPS } from "./episodes/ep001/world.ts";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="MuslimKidsLivingLine001"
    component={Episode001}
    durationInFrames={DURATION}
    fps={FPS}
    width={1080}
    height={1920}
  />
);
