import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./meeting-1320/fonts";
import { SceneContext, TimelineContext } from "./meeting-1320/context";
import { M13Audio } from "./meeting-1320/M13Audio";
import { Subtitles } from "./meeting-1320/Subtitles";
import { Transitions } from "./meeting-1320/Transitions";
import { Grain } from "./meeting-1320/kit";
import { type M13SceneId } from "./meeting-1320/script";
import { C } from "./meeting-1320/theme";
import { buildM13Timeline, type M13Manifest } from "./meeting-1320/timing";
import { SCENES } from "./meeting-1320/scenes";

export type BalaGoMeeting1320Props = {
  // Заполняется в calculateMetadata из public/meeting-1320/voice/manifest.json.
  readonly manifest: M13Manifest;
  // Только черновые кадры (готовые реплики + оценка недостающих).
  readonly preview: boolean;
};

// «13:20дагы жолугушуу» (№31). Рисованные 2D-эпизоды во весь кадр: офис
// директора, город и школьный двор, порог квартиры бабушки, вечерний дом.
// Планы меняются по смыслу (предметный, средний, крупный, общий); рассказчик —
// только голос. Длительность — по фактической речи; финальная карточка с
// контактами неподвижна с начала N20 до конца (≥ 5 с, после слова ≥ 3 с).
export const BalaGoMeeting1320: React.FC<BalaGoMeeting1320Props> = ({ manifest }) => {
  const tl = useMemo(() => buildM13Timeline(manifest), [manifest]);
  return (
    <TimelineContext.Provider value={tl}>
      <AbsoluteFill style={{ backgroundColor: C.paper }}>
        {tl.scenes.map((sc) => {
          const Scene = SCENES[sc.id as M13SceneId];
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
        <Grain />
        <Transitions />
        <Subtitles />
        <M13Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
