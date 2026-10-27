import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./fonts";
import { SceneContext, TimelineContext } from "./suitcase-by-the-door-2d/context";
import { Sd2Audio } from "./suitcase-by-the-door-2d/Sd2Audio";
import { Subtitles } from "./suitcase-by-the-door-2d/Subtitles";
import { Transitions } from "./suitcase-by-the-door-2d/Transitions";
import { C } from "./suitcase-by-the-door-2d/theme";
import { buildSd2Timeline, type Sd2Manifest } from "./suitcase-by-the-door-2d/timing";
import { SCENES } from "./suitcase-by-the-door-2d/scenes";

export type BalaGo36SuitcaseByTheDoor2DProps = {
  // Заполняется в calculateMetadata из public/audio/suitcase-by-the-door-2d/manifest.json.
  readonly manifest: Sd2Manifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

// №36 «Чемодан у двери» (Эшиктин жанындагы чемодан). Рисованная 2D-история
// в стиле видеореференса: кремовая бумага с мягкими диагоналями, тонкий
// контур, короткие тёмно-синие схемы. Шестнадцать сцен S01–S16 стоят на
// шкале фактической речи; рассказчик — только голос.
export const BalaGo36SuitcaseByTheDoor2D: React.FC<BalaGo36SuitcaseByTheDoor2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildSd2Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.bg }}>
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
        <Sd2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
