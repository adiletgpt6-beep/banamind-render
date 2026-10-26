import React from "react";
import { Composition } from "remotion";
import { MuslimKidsThreadsOfWonder011 } from "./compositions/MuslimKidsThreadsOfWonder011";
import { DURATION, FPS, HEIGHT, WIDTH } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="MuslimKidsThreadsOfWonder011"
      component={MuslimKidsThreadsOfWonder011}
      durationInFrames={DURATION}
      fps={FPS}
      width={WIDTH}
      height={HEIGHT}
      defaultProps={{ lod: 1, withAudio: true }}
    />
    {/* Превью 540×960 для контрольных кадров и тестовых рендеров сложных сцен */}
    <Composition
      id="ThreadsOfWonderPreview"
      component={MuslimKidsThreadsOfWonder011}
      durationInFrames={DURATION}
      fps={FPS}
      width={540}
      height={960}
      defaultProps={{ lod: 0.7, withAudio: true }}
    />
  </>
);
