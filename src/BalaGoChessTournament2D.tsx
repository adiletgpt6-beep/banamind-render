import { useMemo } from "react";
import { AbsoluteFill, Sequence } from "remotion";
import "./chess-tournament-2d/fonts";
import { SceneContext, TimelineContext } from "./chess-tournament-2d/context";
import { Ch2Audio } from "./chess-tournament-2d/Ch2Audio";
import { Subtitles } from "./chess-tournament-2d/Subtitles";
import { Transitions } from "./chess-tournament-2d/Transitions";
import { C } from "./chess-tournament-2d/theme";
import { buildCh2Timeline, type Ch2Manifest } from "./chess-tournament-2d/timing";
import { SCENES } from "./chess-tournament-2d/scenes";

export type BalaGoChessTournament2DProps = {
  // Заполняется в calculateMetadata из public/audio/chess-tournament-2d/manifest.json.
  readonly manifest: Ch2Manifest;
  // Только черновые кадры по оценочным таймингам (без озвучки).
  readonly preview: boolean;
};

// №27 «Она сказала, что больше не любит шахматы». Сцены — живые 2D-эпизоды
// во весь кадр (комната, кружок, офис, семейный стол); графические вставки
// (лист, календарь, телефон) — только как планы предметов в руках героев.
// Рассказчик — только голос. Длительность — по фактической речи, контакты —
// последние 150 кадров.
export const BalaGoChessTournament2D: React.FC<BalaGoChessTournament2DProps> = ({ manifest }) => {
  const tl = useMemo(() => buildCh2Timeline(manifest), [manifest]);
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
        <Ch2Audio />
      </AbsoluteFill>
    </TimelineContext.Provider>
  );
};
