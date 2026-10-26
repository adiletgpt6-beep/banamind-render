import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { SceneContext, SubtitlesContext, TimelineContext } from "./lesson-80-1-5/context";
import { L815Audio } from "./lesson-80-1-5/L815Audio";
import { Overlays } from "./lesson-80-1-5/Overlays";
import { L815_SCENE_TITLES, L815_VIDEO, type L815SceneId } from "./lesson-80-1-5/script";
import { buildL815Timeline, type L815Manifest } from "./lesson-80-1-5/timing";
import { SCENES } from "./lesson-80-1-5/scenes";

export type Lesson80_1_5Props = {
  // Заполняется в calculateMetadata из public/audio/lesson-80-1-5/manifest.json.
  readonly manifest: L815Manifest;
  // Встроенные субтитры (по умолчанию выключены; отдельный SRT — scripts/l815-srt.mjs).
  readonly subtitles: boolean;
};

// Урок 1, мини-фильм 5 «А лодочку сделал я!» — 1920×1080, 30 fps; длительность
// вычисляется из фактической озвучки (timing.ts).
export const Lesson80_1_5: React.FC<Lesson80_1_5Props> = ({ manifest, subtitles }) => {
  const tl = useMemo(() => buildL815Timeline(manifest), [manifest]);
  const fps = L815_VIDEO.fps;
  return (
    <TimelineContext.Provider value={tl}>
      <SubtitlesContext.Provider value={subtitles}>
        <AbsoluteFill style={{ backgroundColor: "#F4EEE3" }}>
          {tl.scenes.map((sc) => {
            const Scene = SCENES[sc.id as L815SceneId];
            return (
              <Sequence key={sc.id} name={L815_SCENE_TITLES[sc.id]} from={sc.from} durationInFrames={sc.to - sc.from} premountFor={fps}>
                <SceneContext.Provider value={sc.from}>
                  <AbsoluteFill style={{ overflow: "hidden" }}>
                    <Scene />
                  </AbsoluteFill>
                </SceneContext.Provider>
              </Sequence>
            );
          })}
          <Overlays />
          <L815Audio />
        </AbsoluteFill>
      </SubtitlesContext.Provider>
    </TimelineContext.Provider>
  );
};
