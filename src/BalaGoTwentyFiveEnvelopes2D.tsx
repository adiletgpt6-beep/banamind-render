import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./twenty-five-envelopes-2d/fonts";
import { SceneContext, TimelineContext } from "./twenty-five-envelopes-2d/context";
import { Te2Audio } from "./twenty-five-envelopes-2d/Te2Audio";
import { Subtitles } from "./twenty-five-envelopes-2d/Subtitles";
import { Transitions } from "./twenty-five-envelopes-2d/Transitions";
import { C } from "./twenty-five-envelopes-2d/theme";
import { buildTe2Timeline, type Te2Manifest } from "./twenty-five-envelopes-2d/timing";
import { SCENES } from "./twenty-five-envelopes-2d/scenes";

export type BalaGoTwentyFiveEnvelopes2DProps = {
  // Заполняется в calculateMetadata из public/audio/twenty-five-envelopes-2d/manifest.json.
  readonly manifest: Te2Manifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

// №29 «Жыйырма беш конверт» (Двадцать пять конвертов). Сцены — живые
// 2D-эпизоды во весь кадр (комната Аяна, офисы, ужин, школа); крупные планы
// предметов (конверт, записка, календари, телефон) — в руках героев.
// Рассказчик — только голос. Длительность — по фактической речи, контакты —
// последние 150 кадров.
export const BalaGoTwentyFiveEnvelopes2D: React.FC<BalaGoTwentyFiveEnvelopes2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildTe2Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id];
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
        <Te2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
