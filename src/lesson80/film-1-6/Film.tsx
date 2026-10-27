// Композиция «Кто научил птицу строить гнездо?» (80-1-6): восемь сцен на
// voice-first шкале, голоса, тихая среда, финальная надпись.
import { useMemo } from "react";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SceneContext, TimelineContext } from "../core/context";
import { buildTimeline, type Manifest } from "../core/timing";
import { FPS } from "../core/video";
import { FinalCaption } from "./Caption";
import { FilmAudio } from "./FilmAudio";
import { filmSfx } from "./sound";
import { Scene01 } from "./scenes/Scene01Grass";
import { Scene02 } from "./scenes/Scene02NestPurpose";
import { Scene03 } from "./scenes/Scene03Learning";
import { Scene04 } from "./scenes/Scene04BirdBody";
import { Scene05 } from "./scenes/Scene05Creation";
import { Scene06 } from "./scenes/Scene06Observation";
import { Scene07 } from "./scenes/Scene07Questions";
import { Scene08 } from "./scenes/Scene08Ending";
import { SCENES } from "./script";

export type Lesson80FilmProps = { readonly manifest: Manifest };

const SCENE_COMPONENTS: Record<number, React.FC> = { 1: Scene01, 2: Scene02, 3: Scene03, 4: Scene04, 5: Scene05, 6: Scene06, 7: Scene07, 8: Scene08 };

const CaptionLayer: React.FC<{ total: number }> = ({ total }) => <FinalCaption f={useCurrentFrame()} total={total} />;

export const Lesson80Film: React.FC<Lesson80FilmProps> = ({ manifest }) => {
  const tl = useMemo(() => buildTimeline(manifest), [manifest]);
  const sfx = useMemo(() => filmSfx(tl), [tl]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: "#F1E7D6" }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENE_COMPONENTS[sc.id];
          const from = Math.round(sc.from * FPS);
          const len = Math.round(sc.to * FPS) - from;
          const title = SCENES.find((s) => s.id === sc.id)!.title;
          return (
            <Sequence key={sc.id} name={`Сцена ${sc.id}. ${title}`} from={from} durationInFrames={len} premountFor={FPS}>
              <SceneContext.Provider value={{ from, len }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <CaptionLayer total={tl.durationInFrames} />
        <FilmAudio tl={tl} sfx={sfx} hasVoice={!manifest.estimated} />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
