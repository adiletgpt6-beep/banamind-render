import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./knows-my-name-2d/fonts";
import { SceneContext, TimelineContext } from "./knows-my-name-2d/context";
import { Km2Audio } from "./knows-my-name-2d/Km2Audio";
import { Subtitles } from "./knows-my-name-2d/Subtitles";
import { Transitions } from "./knows-my-name-2d/Transitions";
import { type Km2SceneId } from "./knows-my-name-2d/script";
import { C } from "./knows-my-name-2d/theme";
import { buildKm2Timeline, type Km2Manifest } from "./knows-my-name-2d/timing";
import { SCENES } from "./knows-my-name-2d/scenes";

export type BalaGoKnowsMyName2DProps = {
  // Заполняется в calculateMetadata из public/audio/knows-my-name-2d/manifest.json.
  readonly manifest: Km2Manifest;
  // Только черновые кадры (готовые реплики + оценка недостающих).
  readonly preview: boolean;
};

// «Ал менин атымды билеби?» (№30). Живые 2D-эпизоды во весь кадр: стол
// семьи вечером, два офиса, квартира с няней, школа с двумя входами. Планы
// меняются по смыслу (предметный, средний, крупный, общий); рассказчик —
// только голос. Длительность — по фактической речи, контакты — последние
// 150 кадров.
export const BalaGoKnowsMyName2D: React.FC<BalaGoKnowsMyName2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildKm2Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id as Km2SceneId];
          return (
            <Sequence key={sc.id} name={sc.title} from={sc.from} durationInFrames={sc.to - sc.from} premountFor={30}>
              <SceneContext.Provider value={{ from: sc.from, to: sc.to }}>
                <AbsoluteFill style={{ overflow: "hidden" }}>
                  <Scene />
                </AbsoluteFill>
              </SceneContext.Provider>
            </Sequence>
          );
        })}
        <Transitions />
        <Subtitles />
        <Km2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
