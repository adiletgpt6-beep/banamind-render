import React from "react";
import { Composition } from "remotion";
import { MuslimKidsYasinColorUniverse015 } from "./compositions/MuslimKidsYasinColorUniverse015";
import { DotTest015 } from "./compositions/DotTest015";
import { DURATION_FRAMES, FPS } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="MuslimKidsYasinColorUniverse015" component={MuslimKidsYasinColorUniverse015} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
    <Composition id="DotTest015" component={DotTest015} durationInFrames={270} fps={FPS} width={1080} height={1920} />
  </>
);
